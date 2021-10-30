#version 330 core

out vec4 FragColor;
in vec2 texCoords;

uniform sampler2D screenTexture;
uniform int windowWidth;
uniform int windowHeight;

float widthOffset = 1.0 / windowWidth;
float heightOffset = 1.0 / windowWidth;

#define USED_KERNEL_SIZE 25

vec2 adjacentOffset[9] = {
	vec2(-widthOffset, -heightOffset),	vec2(0, -heightOffset), vec2(widthOffset, -heightOffset),
	vec2(-widthOffset, 0),				vec2(0, 0),				vec2(widthOffset, 0),
	vec2(-widthOffset, heightOffset),	vec2(0, heightOffset),	vec2(widthOffset, heightOffset)
};

vec2 surroundingOffset[25] = {
	2 * vec2(-widthOffset, -heightOffset),	2 * vec2(-widthOffset, -heightOffset),	2 * vec2(0, -heightOffset),		vec2(widthOffset, -heightOffset),	2 * vec2(widthOffset, -heightOffset),
	2 * vec2(-widthOffset, -heightOffset),		vec2(-widthOffset, -heightOffset),		vec2(0, -heightOffset),		vec2(widthOffset, -heightOffset),	2 * vec2(widthOffset, -heightOffset),
	2 * vec2(-widthOffset, 0),					vec2(-widthOffset, 0),					vec2(0, 0),					vec2(widthOffset, 0),				2 * vec2(widthOffset, 0),
	2 * vec2(-widthOffset, heightOffset),		vec2(-widthOffset, heightOffset),		vec2(0, heightOffset),		vec2(widthOffset, heightOffset),	2 * vec2(widthOffset, heightOffset),
	2 * vec2(-widthOffset, heightOffset),	2 * vec2(-widthOffset, heightOffset),	2 * vec2(0, heightOffset),	2 * vec2(widthOffset, heightOffset),	2 * vec2(widthOffset, heightOffset)
};


float blurKernel[9] = {
	1/9.0,		1/9.0,		1/9.0,
	1/9.0,		1/9.0,		1/9.0,
	1/9.0,		1/9.0,		1/9.0
};

float greaterBlurKernel[25] = {
	1/25.0,		1/25.0,		1/25.0,		1/25.0,		1/25.0,
	1/25.0,		1/25.0,		1/25.0,		1/25.0,		1/25.0,
	1/25.0,		1/25.0,		1/25.0,		1/25.0,		1/25.0,
	1/25.0,		1/25.0,		1/25.0,		1/25.0,		1/25.0,
	1/25.0,		1/25.0,		1/25.0,		1/25.0,		1/25.0
};

float outlineKernel[9] = {
	1, 1, 1,
	1, -8, 1,
	1, 1, 1
};

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
	vec3 reflectiveness;

};
uniform Atmosphere atmosphere;

struct Sun {
	vec3 position;
	vec3 color;
};
uniform Sun sun;


vec3 postprocess(vec2 offset[USED_KERNEL_SIZE], float kernel[USED_KERNEL_SIZE]) {
	vec3 color = vec3(0.0);
	for (int i = 0; i < USED_KERNEL_SIZE; i++) {
		vec2 offsettedTexCoord = vec2(max(min((texCoords + offset[i]).x, 1), 0), max(min((texCoords + offset[i]).y, 1), 0));
		color += (texture(screenTexture, offsettedTexCoord).xyz) * kernel[i];
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

	float dIn, dOut;
	if (!solveQuadratic(a, b, c, dOut, dIn)) {
		return vec3(0.0);	// No intersection!
	}
	dIn = max(dIn, 0);
	dOut = max(dOut, 0);
	float travel = dOut - dIn;
	//float normalTravel = travel / (2.0 * atmosphere.radius);
	int maxStep = 25;
	float stepSize = travel / (1.0 * maxStep + 1);
	vec3 rayPosition = rayStart + rayDirection * (dIn + stepSize);
	for (int i = 0; i < maxStep; i++) {
		vec3 sunDir = normalize(sun.position - rayPosition);
		a = dot(sunDir, sunDir);
		b = 2.0 * (dot(sunDir, rayPosition - atmosphere.center)); 
		c = dot(rayPosition - atmosphere.center, rayPosition - atmosphere.center) - atmosphere.radius * atmosphere.radius;
		float dToSunFront, dToSunBack;
		if (!solveQuadratic(a, b, c, dToSunFront, dToSunBack)) {
			continue;
		}
		dToSunFront = max(dToSunFront, 0.000001);
		float depthInatmosphereToSun =  dToSunFront;
		color += sun.color * atmosphere.reflectiveness / depthInatmosphereToSun * stepSize;
		rayPosition += rayDirection * stepSize;
	}
	return color;
}

void main() {
	FragColor = vec4(/*postprocess(surroundingOffset, greaterBlurKernel)*/texture(screenTexture, texCoords).xyz + calculateAtmosphere(), 1.0);
}