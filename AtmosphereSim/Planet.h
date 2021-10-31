#pragma once

#include<string>

#include "VBO.h"
#include "Mesh.h"
#include "SceneObject.h"

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

		glm::vec3 quadratiReflectiveness;
		glm::vec3 linearReflectiveness;
		glm::vec3 constantReflectiveness;

		float quadratiDensity;
		float linearDensity;
		float constantDensity;
	};
	Atmosphere atmosphere;

	float planetRadius;
	Mesh* createMesh(float r);

public:

	Planet(Shader* _shader);

	void exportAtmosphere(Shader& shader);

};
