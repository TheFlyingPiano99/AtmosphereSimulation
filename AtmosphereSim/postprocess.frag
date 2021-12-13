#version 420 core

out vec4 FragColor;
in vec2 texCoords;

layout(binding=0) uniform sampler2D screenColorTexture;
layout(binding=1) uniform sampler2D screenDepthStencilTexture;
uniform int windowWidth;
uniform int windowHeight;
uniform mat4 invMVP;

float widthOffset = 1.0 / windowWidth;
float heightOffset = 1.0 / windowWidth;

#define USED_KERNEL_SIZE 25
#define NUMBER_OF_STARS 750

uniform vec3 stars[NUMBER_OF_STARS];
uniform vec3 starColor;

// Itt volt compile error 
// Eddig az init így nézett ki: vec2 myVec2[n] = { ... };
// A fix: vec2 myVec2[n] = vec2[]( ... );
vec2 adjacentOffset[9] = vec2[](
	vec2(-widthOffset, -heightOffset),	vec2(0, -heightOffset), vec2(widthOffset, -heightOffset),
	vec2(-widthOffset, 0),				vec2(0, 0),				vec2(widthOffset, 0),
	vec2(-widthOffset, heightOffset),	vec2(0, heightOffset),	vec2(widthOffset, heightOffset)
);

vec2 surroundingOffset[25] = vec2[](
	2 * vec2(-widthOffset, -heightOffset),	2 * vec2(-widthOffset, -heightOffset),	2 * vec2(0, -heightOffset),		vec2(widthOffset, -heightOffset),	2 * vec2(widthOffset, -heightOffset),
	2 * vec2(-widthOffset, -heightOffset),		vec2(-widthOffset, -heightOffset),		vec2(0, -heightOffset),		vec2(widthOffset, -heightOffset),	2 * vec2(widthOffset, -heightOffset),
	2 * vec2(-widthOffset, 0),					vec2(-widthOffset, 0),					vec2(0, 0),					vec2(widthOffset, 0),				2 * vec2(widthOffset, 0),
	2 * vec2(-widthOffset, heightOffset),		vec2(-widthOffset, heightOffset),		vec2(0, heightOffset),		vec2(widthOffset, heightOffset),	2 * vec2(widthOffset, heightOffset),
	2 * vec2(-widthOffset, heightOffset),	2 * vec2(-widthOffset, heightOffset),	2 * vec2(0, heightOffset),	2 * vec2(widthOffset, heightOffset),	2 * vec2(widthOffset, heightOffset)
);


float blurKernel[9] = float[](
	1/9.0,		1/9.0,		1/9.0,
	1/9.0,		1/9.0,		1/9.0,
	1/9.0,		1/9.0,		1/9.0
);

float greaterBlurKernel[25] = float[](
	1/25.0,		1/25.0,		1/25.0,		1/25.0,		1/25.0,
	1/25.0,		1/25.0,		1/25.0,		1/25.0,		1/25.0,
	1/25.0,		1/25.0,		1/25.0,		1/25.0,		1/25.0,
	1/25.0,		1/25.0,		1/25.0,		1/25.0,		1/25.0,
	1/25.0,		1/25.0,		1/25.0,		1/25.0,		1/25.0
);

float outlineKernel[9] = float[](
	1, 1, 1,
	1, -8, 1,
	1, 1, 1
);

struct Camera {
	vec3 eye;
	vec3 center;
	vec3 up;
	vec3 right;
	float FOVrad;
	float aspectRatio;
};
uniform Camera camera;

struct Atmosphere {
	vec3 center;
	float radius;
	float planetRadius;
	

	vec3 rayleighScattering;
	float mieScattering;
	float heightOfAverageDensity;


	vec3 quadraticAbsorption;
	vec3 linearAbsorption;
	vec3 constantAbsorption;
	vec3 quadraticScattering;
	vec3 linearScattering;
	vec3 constantScattering;
	vec3 quadratiReflectiveness;
	vec3 linearReflectiveness;
	vec3 constantReflectiveness;
	float quadratiDensity;
	float linearDensity;
	float constantDensity;
};
uniform Atmosphere atmosphere;

struct Sun {
	vec3 position;
	vec3 color;
};
uniform Sun sun;

uniform float exposure;
uniform float gamma;

float near = 0.1f;
float far = 200.0f;

float linearizeDepth(float depth) {
	return (2.0 * near * far) / (far + near - (depth * 2.0 - 1.0) * (far - near));
}

float logisticDepth(float depth, float steepness, float offset) {
	float zVal = linearizeDepth(depth);
	return 1 / (1 + exp(-steepness * (zVal - offset)));
}

vec3 decodeLocation()
{
  vec4 clipSpaceLocation;
  clipSpaceLocation.xy = texCoords * 2.0f - 1.0f;
  clipSpaceLocation.z = texture(screenDepthStencilTexture, texCoords).r * 2.0f - 1.0f;
  clipSpaceLocation.w = 1.0f;
  vec4 homogenousLocation = invMVP * clipSpaceLocation;
  return homogenousLocation.xyz / homogenousLocation.w;
}

vec3 postprocess(vec2 offset[USED_KERNEL_SIZE], float kernel[USED_KERNEL_SIZE]) {
	vec3 color = vec3(0.0);
	for (int i = 0; i < USED_KERNEL_SIZE; i++) {
		vec2 offsettedTexCoord = vec2(max(min((texCoords + offset[i]).x, 1), 0), max(min((texCoords + offset[i]).y, 1), 0));
		color += (texture(screenColorTexture, offsettedTexCoord).xyz) * kernel[i];
	}
	return color;
}

void calculateRayStart(vec2 normalCameraCoord, out vec3 rayStart, out vec3 rayDir) {
	float scale = tan(camera.FOVrad / 2.0);
	rayStart = camera.center
			+ camera.right * camera.aspectRatio * scale * normalCameraCoord.x
			+ camera.up * scale * normalCameraCoord.y;
	rayDir = normalize(rayStart - camera.eye);
	rayStart = camera.eye;
}

bool solveQuadratic(float a, float b, float c, out float x1, out float x2) {
	float discriminant = b * b - 4 * a * c;
	if (discriminant < 0.0) {
		return false;
	}
	x1 = (-b + sqrt(discriminant)) / (2.0 * a);
	x2 = (-b - sqrt(discriminant)) / (2.0 * a);
	return true;
}

bool intersectSphere(vec3 rayDir, vec3 rayPos, vec3 sphereCenter, float sphereRadius, out float shortDist, out float longDist){
	float a = dot(rayDir, rayDir);
	float b = 2.0 * (dot(rayDir, rayPos - sphereCenter)); 
	float c = dot(rayPos - sphereCenter, rayPos - sphereCenter) - sphereRadius * sphereRadius;
	return solveQuadratic(a, b, c, longDist, shortDist);
}

bool intersectCone(vec3 rayDir, vec3 rayPos, vec3 coneTip, vec3 coneDir, float coneHalfAngle, out float shortDist, out float longDist){
	float DdotV = dot(rayDir, coneDir);
	float cosTheta =cos(coneHalfAngle);
	float cosThetaSquare = cosTheta * cosTheta;
	float O = length(rayPos);
	float a = DdotV * DdotV - cosThetaSquare;
	float b = 2.0 * (DdotV * dot(coneTip * O, coneDir) - dot(rayDir, coneTip * O * cosThetaSquare)); 
	float c = dot(coneTip * O, coneDir) * dot(coneTip * O, coneDir) - dot(coneTip * O, coneTip * O * cosThetaSquare);
	return solveQuadratic(a, b, c, longDist, shortDist);
}

vec3 calculateAtmosphere() {
	vec3 color = vec3(0.0);
	vec3 rayStart;
	vec3 rayDirection;
	calculateRayStart(texCoords * 2 - 1, rayStart, rayDirection);
	
	//IntersectAtmosphere	

	float shortDist, longDist;
	if (!intersectSphere(rayDirection, rayStart, atmosphere.center, atmosphere.radius, shortDist, longDist)) {
		return vec3(0.0);	// No intersection with the atmosphere!
	}
	shortDist = max(shortDist, 0);
	longDist = max(longDist, 0);

	// Test intersection with the planet located in atmosphere:
	/*
	float shortPlanetDist, longPlanetDist;
	if (intersectSphere(rayDirection, rayStart, atmosphere.center, atmosphere.planetRadius, shortPlanetDist, longPlanetDist)) {
		if (longDist > longPlanetDist && longPlanetDist > 0) {
			longDist = longPlanetDist;
		}
		if (longDist > shortPlanetDist && shortPlanetDist > 0) {
			longDist = shortPlanetDist;
		}
	}
	*/

	float bufferDepth = linearizeDepth(texture(screenDepthStencilTexture, texCoords).x);
	if (bufferDepth < longDist) {
		longDist = bufferDepth;
	}
	if (shortDist > longDist) {
		return vec3(0.0);
	}

	float travel = longDist - shortDist;
	//float normalTravel = travel / (2.0 * atmosphere.radius);
	int maxStep = 50;
	float stepSize = travel / (1.0 * maxStep + 1);
	vec3 rayPosition = rayStart + rayDirection * (shortDist + stepSize);
	float depthInatmosphereToEye = stepSize;
	for (int i = 0; i < maxStep; i++) {
		vec3 sunDir = normalize(sun.position - rayPosition);
		float shortDistToSun, longDistToSun;
		if (!intersectSphere(sunDir, rayPosition, atmosphere.center, atmosphere.radius, shortDistToSun, longDistToSun)) {
			continue;
		}
		shortDistToSun = max(shortDistToSun, 0);
		longDistToSun = max(longDistToSun, 0);
		float shortPlanetDistToSun, longPlanetDistToSun;
		bool inShadow = false;
		if (intersectSphere(sunDir, rayPosition, atmosphere.center, atmosphere.planetRadius, shortPlanetDistToSun, longPlanetDistToSun)) {
			if (shortPlanetDistToSun > 0 || longPlanetDistToSun > 0) {
				inShadow = true;	// Sun behind planet
			}
			else if (shortPlanetDistToSun < 0 && longPlanetDistToSun > 0) {
				inShadow = true;	// Inside planet
			}
		}
		float depthInatmosphereToSun =  longDistToSun - shortDistToSun;
		if (!inShadow) {
			float fullDepth = depthInatmosphereToSun + depthInatmosphereToEye;
			//float distanceFromAtmEdgeToSun = length(rayPosition + dToSunFront * sunDir - sun.position);
			float d = max(atmosphere.radius - length(rayPosition - atmosphere.center), 0.0);
			float density = d * d * atmosphere.quadratiDensity + d * atmosphere.linearDensity + atmosphere.constantDensity; 
			float scaterAngle = max(dot(sunDir, rayDirection), 0);
			float reflectAngle = max(dot(sunDir, -rayDirection), 0);
			color += sun.color /* / (distanceFromAtmEdgeToSun * distanceFromAtmEdgeToSun)*/ * density * stepSize
					* (scaterAngle * scaterAngle * atmosphere.quadraticScattering + scaterAngle * atmosphere.linearScattering + atmosphere.constantScattering)
					* (reflectAngle * reflectAngle * atmosphere.quadratiReflectiveness + reflectAngle * atmosphere.linearReflectiveness + atmosphere.constantReflectiveness)
					/ (fullDepth * fullDepth * atmosphere.quadraticAbsorption
					+ fullDepth * atmosphere.linearAbsorption
					+atmosphere.constantAbsorption);
		}

		rayPosition += rayDirection * stepSize;
		depthInatmosphereToEye += stepSize;
	}

	// Checks if any of the color values are outside of the displayable values and displays white instead of em.
	// We can check if we need HDR (if any white spaces show up)
	/*if (color.r > 1.0 || color.g > 1.0 || color.b > 1.0)
		return vec3(1, 1, 1);*/

	return max(color, 0);
}

vec3 calculateStars(float atmosphereIntensity) {
	if (texture(screenDepthStencilTexture, texCoords).x < 1.0) {
		return vec3(0);
	}
	vec3 rayStart;
	vec3 rayDirection;
	calculateRayStart(texCoords * 2 - 1, rayStart, rayDirection);

	for (int i = 0; i < NUMBER_OF_STARS / 2; i++) {
		float cosTheta = dot(stars[i], rayDirection);
		if (cosTheta > 0.999999f) {
			if (atmosphereIntensity > 0.0f) {
				return starColor / (atmosphereIntensity * 50);
			}
			else {
				return starColor;
			}
		}
	}
	return vec3(0);
}

// ---------------- EXPONENTIAL OPTICAL DEPTH START ----------------
float densityFalloff = 3.0f;

// does it intersect planet? if it dont set planetvalue to 10000000000000000000
// does it intesect atmosphere? if it dont intersect either return -1
float rayLengthThroughAtmosphere(vec3 rayStart, vec3 rayDir, bool useDepthBuffer, out vec3 startPos, out bool inShadow)
{
	bool intersectedPlanet = false;
	inShadow = false;
	vec3 planetIntersectionPoint;

	// we assume that the planet radius is 3 and the atmposphere radius is 5
	// we need to solve two quadratic equations one for the atmosphere one for the planet
	// get the second point of the line
	vec3 rayPoint = rayStart + rayDir;
	float u1;
	float u2;
	if (useDepthBuffer) {
		planetIntersectionPoint = decodeLocation();
		if (length(planetIntersectionPoint - rayStart) < 100.0f) {
			intersectedPlanet = true;
		}
	}
	else {
		if (intersectSphere(rayDir, rayStart, atmosphere.center, atmosphere.planetRadius, u1, u2))
		{
			if (u1 > 0 || u2 > 0)
			{
				intersectedPlanet = true;
				inShadow = true;
				float lowerU = u1;
				float higherU = u2;
				if (u2 < u1) 
				{
					lowerU = u2;
					higherU = u1;
				}
				float finalU;
				if (lowerU > 0) finalU = lowerU;
				else finalU = higherU;
				planetIntersectionPoint = rayStart + finalU * rayDir;
				if (useDepthBuffer) {
					vec3 decoded = decodeLocation();
					float fromDepthBuffer = length(rayStart - decoded);
					if (finalU > fromDepthBuffer) {
						planetIntersectionPoint = decoded;
					}
				}
			}
		}
	}

	if (intersectSphere(rayDir, rayStart, atmosphere.center, atmosphere.radius, u1, u2))
	{
		if (u1 > 0 || u2 > 0)
		{
			vec3 firstIntersectionPoint;
			vec3 secondIntersectionPoint;

			float lowerU = u1;
			float higherU = u2;
			if (u2 < u1) 
			{
				lowerU = u2;
				higherU = u1;
			}

			float firstU = higherU;
			float secondU = lowerU;
			if (lowerU < 0.0f) secondU = 0.0f;

			vec3 firstIntersectPoint = rayStart + firstU * rayDir;
			vec3 secondIntersectPoint = rayStart + secondU * rayDir;
		
			startPos = secondIntersectPoint;
			if (intersectedPlanet) return distance(planetIntersectionPoint, secondIntersectPoint);
			else return abs(firstU - secondU);
		}
	}
	// What is this doing?
	return -1.0f;
}

float densityAtPoint(vec3 point)
{
	// height above planet surface (vec3(0.0, 0.0, 0.0) = center, 3.0 = radius)
	float heightAboveSurface = length(point - atmosphere.center) - atmosphere.planetRadius;
	// correcting the exp function so it intersects at y = 0, x = 1
	float height01 = heightAboveSurface / (atmosphere.radius - atmosphere.planetRadius);
	// return local density
	return exp(-height01 * densityFalloff) * (1 - height01);
}

int opticalDepthPointNumber = 10;

vec3 outScattering(vec3 rayOrigin, vec3 rayDir, float rayLength, vec3 scattering)
{
	vec3 densitySamplePoint = rayOrigin;
	float stepSize = rayLength / (opticalDepthPointNumber - 1);
	vec3 opticalDepth = vec3(0.0f);
	for (int i = 0; i < opticalDepthPointNumber; i++)
	{
		float localDensity = densityAtPoint(densitySamplePoint);

		opticalDepth += localDensity * stepSize;
		densitySamplePoint += rayDir * stepSize;
	}
	
	return 4.0f * 3.14f * scattering * opticalDepth;
}

float phaseFunction(float cosTheta, float g) {
	return (3 * (1 - g * g)) / (2 * (2 + g * g))
	* (1 + cosTheta * cosTheta) / pow(1 + g * g - 2 * g * cosTheta, 1.5);
}

vec3 inScattering(vec3 inScatterPoint, vec3 viewDir, vec3 sunDir, float viewRayLength, float sunRayLength, vec3 scattering, float g) {
	// get the optical depth to and from the inscatterPoint
	vec3 sunRayOpticalDepth = outScattering(inScatterPoint, sunDir, sunRayLength, scattering);
	vec3 viewRayOpticalDepth = outScattering(inScatterPoint, -viewDir, viewRayLength, scattering);
	// calculate transmittance according to the optical depth
	vec3 transmittance = exp(-(sunRayOpticalDepth + viewRayOpticalDepth));
	// get the local density at the inScatterPoint
	float localDensity = densityAtPoint(inScatterPoint);
	float phase = phaseFunction(dot(sunDir, -viewDir), g);
	return scattering * phase * localDensity * transmittance;
}


int inScatterPointNumber = 10;

vec3 calculateLight(vec3 rayStartPos, vec3 viewDir, float viewRayLength)
{
	vec3 inScatterPoint = rayStartPos;
	vec3 inScatteredLight = vec3(0.0f);
	bool prevWasInShadow = false;
	float coneShortDist, coneLongDist;
	bool coneIntersected = false;	// No need to calculate intersection twice.
	float coneHalfAngle = atan(atmosphere.planetRadius / length(atmosphere.center - sun.position));
	if (coneHalfAngle > 1.0f) {
		return vec3(1, 0, 0);
	}
	coneIntersected = intersectCone(viewDir, rayStartPos, sun.position, normalize(atmosphere.center - sun.position), coneHalfAngle, coneShortDist, coneLongDist);
	if (coneIntersected) {	
		if (coneShortDist < 0.0f) {
			coneShortDist = 0.0f;
		}
		if (coneLongDist < 0.0f) {
			coneIntersected = false;
		}
		/*
		if (coneIntersected) {
			coneIntersected = (0.0f < dot(atmosphere.center - sun.position, rayStartPos + viewDir * coneShortDist - atmosphere.center))
						&& (0.0f < dot(atmosphere.center - sun.position, rayStartPos + viewDir * coneLongDist - atmosphere.center));		// Only behind planet.
		}
		*/
	}
	float incrementalViewRayLength;
	float stepSize = viewRayLength / (inScatterPointNumber - 1.0);
	incrementalViewRayLength = 0;
	while(incrementalViewRayLength < viewRayLength)
	{
		// calculateDirToSun
		vec3 sunDir = normalize(sun.position - inScatterPoint);
		vec3 startPos;	// Not used.
		bool inShadow;
		// calculate the distance to the sun from the in scatter point
		float sunRayLength = rayLengthThroughAtmosphere(inScatterPoint, sunDir, false, startPos, inShadow);
		// should not do anything if the inScatterPoint is in shade

		if (!inShadow) {
			vec3 rayleigh = inScattering(inScatterPoint, viewDir, sunDir, incrementalViewRayLength, sunRayLength, atmosphere.rayleighScattering, 0.0f);
			vec3 mie = inScattering(inScatterPoint, viewDir, sunDir, incrementalViewRayLength, sunRayLength, vec3(atmosphere.mieScattering), -0.99f);
			inScatteredLight += (rayleigh + mie) * stepSize;
		}

		inScatterPoint += viewDir * stepSize;
		incrementalViewRayLength += stepSize;
	}

	return sun.color * inScatteredLight;
}
// ---------------- EXPONENTIAL OPTICAL DEPTH END ----------------

void main() {
	vec3 hdrColor;
	/*
	vec3 atmosphere = calculateAtmosphere();
	// NO HDR
	//FragColor = vec4(texture(screenColorTexture, texCoords).xyz + atmosphere + calculateStars(length(atmosphere)), 1.0);
	
	//With HDR
	hdrColor = vec4(texture(screenColorTexture, texCoords).xyz + atmosphere + calculateStars(length(atmosphere)), 1.0).rgb;
	*/
	
	//--------------------------------------------------------------------------------------

	// FALIED EXPONENTIAL EXPERIMENTATION
	//FragColor = vec4(texture(screenColorTexture, texCoords).xyz, 1.0f);

	

	vec3 cameraRayStart;
	vec3 cameraRayDirection;
	calculateRayStart(texCoords * 2 - 1, cameraRayStart, cameraRayDirection);
	vec3 rayStartInAtmospherePos;
	bool inShadow; // Not used here.
	float rayLengthOfViewRay = rayLengthThroughAtmosphere(cameraRayStart, cameraRayDirection, true, rayStartInAtmospherePos, inShadow);
	if (rayLengthOfViewRay > 0.0f)
	{
		vec3 atmosphereColor = calculateLight(rayStartInAtmospherePos, cameraRayDirection, rayLengthOfViewRay);
		vec3 stars = calculateStars(length(atmosphereColor));
		//we need to weight the original color with the atmospheres color in some way
		hdrColor = vec4(texture(screenColorTexture, texCoords).rgb + atmosphereColor + stars, 1.0f).rgb;
	}
	else
	{
		vec3 stars = calculateStars(0);
		hdrColor = vec4(texture(screenColorTexture, texCoords).rgb + stars, 1.0f).rgb;
	}

	//End of Exponential calculations-----------------------------------------------------------

	//...
	//It would be nice to make the Sun have bloom.

	//End of bloom----------------------------------------------

	// HDR Tone mapping
    vec3 result = vec3(1.0) - exp(-hdrColor * exposure);

	// GAMMA CORRECTION (OPTIONAL)
    result = pow(result, vec3(1.0 / gamma));

	FragColor = vec4(result, 1.0f);

}