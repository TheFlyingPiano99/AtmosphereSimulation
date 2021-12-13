#pragma once

#include<glm/glm.hpp>
#include "shaderClass.h"
#include "Camera.h"
#include "Planet.h"
#include "Sun.h"

class PostprocessUnit
{
	unsigned int FBO;
	unsigned int RBO;
	Shader* shader;
	unsigned int rectVAO, rectVBO;
	unsigned int framebufferColorTexture;
	unsigned int framebufferDepthStencilTexture;

	float gamma = 1.1f;
	float exposure = 0.98f;

	void exportData();

public:

	void init();
	void preDrawInit(const glm::vec4& backgroundColor);
	void render(Camera& camera, Planet& planet, Sun& sun);
	Shader* getShader();
	~PostprocessUnit();

	float* getGamma();
	float* getExposure();
};

