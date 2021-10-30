#pragma once

#include<string>

#include "VBO.h"
#include "Mesh.h"
#include "SceneObject.h"

class Planet : public SceneObject
{
	glm::vec3 atmosphereReflectiveness = glm::vec3(0.0001f, 0.001f, 0.01f);
	float planetRadius = 1.0f;
	float atmosphereRadius = 1.5f;
	Mesh* createMesh(float r);

public:

	Planet(Shader* _shader): SceneObject(nullptr, _shader) {
		this->mesh = createMesh(planetRadius);
	}

	void exportAtmosphere(Shader& shader);

};
