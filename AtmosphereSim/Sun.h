#pragma once
#include "SceneObject.h"

class Sun : public SceneObject
{
public:

	Sun(Shader* _shader) : SceneObject(nullptr, _shader) {
		mesh = Mesh::createSphere(0.2f, std::vector<glm::vec3>());
	}

	void exportData(Shader& shader) {
		glUniform3f(glGetUniformLocation(shader.ID, "sun.position"), position.x, position.y, position.z);
		glm::vec3 color = light->getDiffuse();
		glUniform3f(glGetUniformLocation(shader.ID, "sun.color"), color.x, color.y, color.z);
	}


};

