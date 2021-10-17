#pragma once


#include "shaderClass.h"
#include<glm/glm.hpp>

class LightSource
{
	glm::vec4 color;
	glm::vec3 Position;
	float intensity;

public:
	LightSource(glm::vec4 _color, float _intensity, glm::vec3 pos) : color(_color), Position(pos), intensity(_intensity) {
	}

	void setColor(glm::vec4 _color) {
		color = _color;
	}

	void setPosition(glm::vec3 pos) {
		Position = pos;
	}

	virtual void control(float dt);
	virtual void animate(float dt);

	/*
	* Export light source data onto shader
	*/
	void exportData(Shader* shader);
};

