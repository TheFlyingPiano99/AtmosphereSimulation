#version 420 core

out vec4 FragColor;
in vec2 texCoords;

layout(binding=0) uniform sampler2D screenColorTexture;
layout(binding=1) uniform sampler2D screenDepthStencilTexture;
uniform int windowWidth;
uniform int windowHeight;

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
}

bool solveQuadratic(float a, float b, float c, out float x1, out float x2) {
	float discriminant = b * b - 4 * a * c;
	if (discriminant < 0.0) {
		return false;
	}
	x1 = (-b + sqrt(discriminant)) / (2 * a);
	x2 = (-b - sqrt(discriminant)) / (2 * a);
	return true;
}

bool intersectSphere(vec3 rayDir, vec3 rayPos, vec3 sphereCenter, float sphereRadius, out float shortDist, out float longDist){
	float a = dot(rayDir, rayDir);
	float b = 2.0 * (dot(rayDir, rayPos - sphereCenter)); 
	float c = dot(rayPos - sphereCenter, rayPos - sphereCenter) - sphereRadius * sphereRadius;
	return solveQuadratic(a, b, c, longDist, shortDist);
}

vec3 calculateAtmosphere() {
	vec3 color = vec3(0.0);
	vec3 rayStart;
	vec3 rayDirection;
	calculateRayStart(texCoords * 2 - 1, rayStart, rayDirection);
	
	//IntersectAtmosphere
	float a, b, c;
	a = dot(rayDirection, rayDirection);
	b = 2.0 * (dot(rayDirection, rayStart - atmosphere.center)); 
	c = dot(rayStart - atmosphere.center, rayStart - atmosphere.center) - atmosphere.radius * atmosphere.radius;
	

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
		if (dot(stars[i], rayDirection) > 0.999999) {
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

void main() {
	vec3 atmosphere = calculateAtmosphere();

	// NO HDR
	//FragColor = vec4(/*postprocess(surroundingOffset, greaterBlurKernel)*/texture(screenTexture, texCoords).xyz + atmosphere + calculateStars(length(atmosphere)), 1.0);

	// WITH HDR

	vec3 hdrColor = vec4(texture(screenColorTexture, texCoords).xyz + atmosphere + calculateStars(length(atmosphere)), 1.0).rgb;

	// HDR Tone mapping
    vec3 result = vec3(1.0) - exp(-hdrColor * exposure);

	// GAMMA CORRECTION (OPTIONAL)
    result = pow(result, vec3(1.0 / gamma));

   FragColor = vec4(result, 1.0) /** texture(screenDepthStencilTexture, texCoords)*/;

	// displays only the oputput of the default shader
	//FragColor = vec4(texture(screenColorTexture, texCoords).xyz, 1.0f);
}