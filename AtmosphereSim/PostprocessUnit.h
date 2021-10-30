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
	unsigned int framebufferTexture;

public:

	void init();
	void preDrawInit(const glm::vec4& backgroundColor);
	void render(Camera& camera, Planet& planet, Sun& sun);

};

