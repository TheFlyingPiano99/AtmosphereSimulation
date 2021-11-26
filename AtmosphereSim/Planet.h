#pragma once

#include<string>

#include "VBO.h"
#include "Mesh.h"
#include "SceneObject.h"

#define NUMBER_OF_COLORS 4

class Planet : public SceneObject
{
	struct Atmosphere {
		glm::vec3 center;
		float radius;

		glm::vec3 quadraticAbsorption;
		glm::vec3 linearAbsorption;
		glm::vec3 constantAbsorption;

		glm::vec3 quadraticScattering;
		glm::vec3 linearScattering;
		glm::vec3 constantScattering;

		glm::vec3 quadraticReflectiveness;
		glm::vec3 linearReflectiveness;
		glm::vec3 constantReflectiveness;

		float quadraticDensity;
		float linearDensity;
		float constantDensity;
	};
	Atmosphere atmosphere;

	glm::vec3 colors[NUMBER_OF_COLORS] = {
		glm::vec3(0.0117f, 0.9882f, 0.4196f),
		glm::vec3(0.2f, 0.9882f, 0.4196f),
		glm::vec3(0.0f, 1.0f, 0.4f),
		glm::vec3(0.0117f, 0.9882f, 0.6f)
	};

	float planetRadius;
	Mesh* createMesh(float r);

	void generateIcosaFace(glm::vec3 a, glm::vec3 b, glm::vec3 c, int resolution, float r, std::vector<glm::vec3>* vertices, std::vector<GLuint>* indices);

public:

	Planet(Shader* _shader);

	void exportAtmosphere(Shader& shader);

	float* getQuadraticDensity();
	float* getLinearDensity();
	float* getConstantDensity();

	glm::vec3* getQuadraticAbsorption();
	glm::vec3* getLinearAbsorption();
	glm::vec3* getConstantAbsorption();

	glm::vec3* getQuadraticScattering();
	glm::vec3* getLinearScattering();
	glm::vec3* getConstantScattering();

	glm::vec3* getQuadraticReflectiveness();
	glm::vec3* getLinearReflectiveness();
	glm::vec3* getConstantReflectiveness();
};
