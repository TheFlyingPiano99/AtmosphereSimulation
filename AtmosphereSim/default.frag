#version 330 core


// Outputs colors in RGBA
out vec4 FragColor;

// Imports the current position from the Vertex Shader
in vec3 crntPos;
// Imports the normal from the Vertex Shader
in vec3 Normal;
// Imports the color from the Vertex Shader
in vec3 color;
// Imports the texture coordinates from the Vertex Shader
in vec2 texCoord;

struct DirLight {
	vec3 direction;

	vec3 ambient;
	vec3 diffuse;
	vec3 specular;
};
uniform DirLight dirLight;

struct PointLight {
	vec3 position;

	float constant;
	float linear;
	float quadratic;

	vec3 ambient;
	vec3 diffuse;
	vec3 specular;
};
#define NO_OF_POINT_LIGHTS 4
uniform PointLight pointLights[NO_OF_POINT_LIGHTS];

struct SpotLight {
	vec3 position;
	vec3 direction;
	//TODO
};
uniform SpotLight spotLight;
uniform float shininess;

// Gets the Texture Units from the main function
uniform sampler2D diffuse0;
uniform sampler2D specular0;

// Gets the position of the camera from the main function
uniform vec3 camPos;

uniform vec3 camDir;

vec3 calculatePointLight(PointLight light, vec3 fragPos, vec3 normal, vec3 viewDir)
{	
	// used in two variables so I calculate it here to not have to do it twice
	vec3 lightVec = light.position - fragPos;

	// intensity of light with respect to distance
	float dist = length(lightVec);
	float attenuation = 1 / (light.quadratic * dist * dist + light.linear * dist + light.constant);

	// ambient lighting
	vec3 ambient = light.ambient;

	// diffuse lighting
	vec3 lightDir = normalize(lightVec);
	float diffAmount = max(dot(normal, lightDir), 0.0f);
	vec3 diffuse = diffAmount * light.diffuse * color/*texture(diffuse0, texCoord).xyz*/;
	 
	// specular lighting
	vec3 reflectDir = reflect(-lightDir, normal);
	float specAmount = pow(max(dot(viewDir, reflectDir), 0.0f), shininess);
	vec3 specular = specAmount * light.specular * texture(specular0, texCoord).r;

	ambient *= attenuation;
	diffuse *= attenuation;
	specular *= attenuation;

	return ambient + diffuse + specular;
}


vec3 calculateDirectionalLight(DirLight light, vec3 fragPos, vec3 normal, vec3 viewDir)
{
	// ambient lighting
	vec3 ambient = light.ambient;

	// diffuse lighting
	vec3 lightDir = light.direction;
	float diffAmount = max(dot(normal, lightDir), 0.0f);
	vec3 diffuse = diffAmount * light.diffuse * color/*texture(diffuse0, texCoord).xyz*/;

	// specular lighting
	vec3 reflectDir = reflect(-lightDir, normal);
	float specAmount = pow(max(dot(viewDir, reflectDir), 0.0f), shininess);
	vec3 specular = specAmount * light.specular * texture(specular0, texCoord).r;

	return ambient + diffuse + specular;
}



/*
vec4 calculateSpotLight()
{
	// controls how big the area that is lit up is
	float outerCone = 0.90f;
	float innerCone = 0.95f;

	// ambient lighting
	float ambient = 0.20f;

	// diffuse lighting
	vec3 normal = normalize(normal);
	vec3 lightDirection = normalize(lightPos - crntPos);
	float diffuse = max(dot(normal, lightDirection), 0.0f);

	// specular lighting
	float specularLight = 0.50f;
	vec3 viewDirection = normalize(camPos - crntPos);
	vec3 reflectionDirection = reflect(-lightDirection, normal);
	float specAmount = pow(max(dot(viewDirection, reflectionDirection), 0.0f), 16);
	float specular = specAmount * specularLight;

	// calculates the intensity of the crntPos based on its angle to the center of the light cone
	float angle = dot(vec3(0.0f, -1.0f, 0.0f), -lightDirection);
	float inten = clamp((angle - outerCone) / (innerCone - outerCone), 0.0f, 1.0f);

	return (texture(diffuse0, texCoord) * (diffuse * inten + ambient) + texture(specular0, texCoord).r * specular * inten) * lightColor;
}
*/

float near = 0.1f;
float far = 200.0f;

float linearizeDepth(float depth) {
	return (2.0 * near * far) / (far + near - (depth * 2.0 - 1.0) * (far - near));
}

float logisticDepth(float depth, float steepness, float offset) {
	float zVal = linearizeDepth(depth);
	return 1 / (1 + exp(-steepness * (zVal - offset)));
}

// ---------------- EXPONENTIAL OPTICAL DEPTH START ----------------
float densityFalloff = 3.0f;

float rayLengthThroughAtmosphere(vec3 rayStart, vec3 rayDir)
{
	// we assume that the planet radius is 3 and the atmposphere radius is 5
	// we need to solve two quadratic equations one for the atmosphere one for the planet
	// get the second point of the line
	vec3 rayPoint = rayStart + rayDir;

	// using this as guide http://paulbourke.net/geometry/circlesphere/
	// we also assume that the center of the planet is at 0 0 0
	float a = pow((rayPoint.x - rayStart.x), 2) + pow((rayPoint.y - rayStart.y), 2) + pow((rayPoint.z - rayStart.z), 2);
	float b = 2 * ((rayPoint.x - rayStart.x) * rayStart.x + (rayPoint.y - rayStart.y) * rayStart.y + (rayPoint.z - rayStart.z) * rayStart.z);
	float c = pow(rayStart.x, 2) + pow(rayStart.y, 2) + pow(rayStart.z, 2) + 3.0f * 3.0f;

	float dForPlanet = b * b - 4 * a * c;
	if (dForPlanet > 0)
	{
		float u1 = (-b + sqrt(dForPlanet)) / (2 * a);
		float u2 = (-b + sqrt(dForPlanet)) / (2 * a);

		if (u1 > 0 || u2 > 0)
			return -1.0f;
	}

	c = pow(rayStart.x, 2) + pow(rayStart.y, 2) + pow(rayStart.z, 2) + 5.0f * 5.0f;

	float dForAtmosphere = b * b - 4 * a * c;
	if (dForAtmosphere > 0)
	{
		float u1 = (-b + sqrt(dForPlanet)) / (2 * a);
		float u2 = (-b + sqrt(dForPlanet)) / (2 * a);

		float higherU = u1;
		if (u2 > u1)
		{
			higherU = u2;
		}

		vec3 intersectionPointPoz = vec3(rayStart.x + higherU * (rayPoint.x - rayStart.x), rayStart.y + higherU * (rayPoint.y - rayStart.y), rayStart.z + higherU * (rayPoint.z - rayStart.z));
		// ONLY WORKS CORRECTLY IF WE R INSIDE THE ATMOSPHERE
		return distance(rayStart, intersectionPointPoz);
	}
}

float densityAtPoint(vec3 point)
{
	// height above planet surface (vec3(0.0, 0.0, 0.0) = center, 3.0 = radius)
	float heightAboveSurface = length(point - vec3(0.0f, 0.0f, 0.0f)) - 3.0f;
	// correcting the exp function so it intersects at y = 0, x = 1
	float height01 = heightAboveSurface / (5.0f - 3.0f);
	// return local density
	return exp(-height01 * densityFalloff) * (1 - height01);
}

int opticalDepthPointNumber = 10;

float opticalDepth(vec3 rayOrigin, vec3 rayDir, float rayLength)
{
	vec3 densitySamplePoint = rayOrigin;
	float stepSize = rayLength / (opticalDepthPointNumber - 1);
	float opticalDepth = 0.0f;

	for (int i = 0; i < opticalDepthPointNumber; i++)
	{
		float localDensity = densityAtPoint(densitySamplePoint);

		opticalDepth += localDensity * stepSize;
		densitySamplePoint += rayDir * stepSize;
	}

	return opticalDepth;
}

int inScatterPointNumber = 10;
vec3 sunPos = vec3(10.0f, 0.0f, 0.0f);

float calculateLight(vec3 viewOrigin, vec3 viewDir, float viewRayLength)
{
	vec3 inScatterPoint = viewOrigin;
	float stepSize = viewRayLength / (inScatterPointNumber - 1);

	float inScatteredLight = 0.0f;

	for (int i = 0; i < inScatterPointNumber; i++)
	{
		// calculateDirToSun
		vec3 dirToSun = normalize(inScatterPoint - sunPos);

		// calculate the distance to the sun from the in scatter point
		float sunRayLength = rayLengthThroughAtmosphere(inScatterPoint, dirToSun);
		// should not do anything if the inScatterPoint is in shade
		if (sunRayLength >= 0.0f)
		{
			// get the optical depth to and from the inscatterPoint
			float sunRayOpticalDepth = opticalDepth(inScatterPoint, dirToSun, sunRayLength);
			float viewRayOpticalDepth = opticalDepth(inScatterPoint, -viewDir, stepSize * i);
			// calculate transmittance according to the optical depth
			float transmittance = exp(-(sunRayOpticalDepth + viewRayOpticalDepth));
			// get the local density at the inScatterPoint
			float localDensity = densityAtPoint(inScatterPoint);

			inScatteredLight += localDensity * transmittance * stepSize;
		}

		inScatterPoint += viewDir * stepSize;
	}

	return inScatteredLight;
}
// ---------------- EXPONENTIAL OPTICAL DEPTH END ----------------

void main()
{
	vec3 normal = normalize(Normal);
	vec3 viewDir = normalize(camPos - crntPos);
	vec3 lightSum = vec3(0, 0, 0);

	lightSum += calculateDirectionalLight(dirLight, crntPos, normal, viewDir);

	for (int i = 0; i < NO_OF_POINT_LIGHTS; i++) {
		lightSum += calculatePointLight(pointLights[i], crntPos, normal, viewDir);
	}
	//float depth = logisticDepth(gl_FragCoord.z, 0.5, 5.0);
	//FragColor = vec4(lightSum * (1 - depth) + depth * vec3(0.07, 0.13, 0.17), 1.0f);
	FragColor = vec4(lightSum, 1.0f);

	// for when we have the camDir uniform
	/*float rayLengthOfViewRay = rayLengthThroughAtmosphere(camPos, camDir);
	if (rayLengthOfViewRay > 0.0f)
	{
		float atmosphereColor = calculateLight(camPos, camDir, rayLengthThroughAtmosphere(camPos, camDir));
		// we need to weight the original color with the atmospheres color in some way
		//FragColor = vec4(lightSum * 0.2f + atmosphereColor * 0.5f);
	}
	else
	{
		//FragColor = vec4(lightSum, 1.0f);
	}*/
}