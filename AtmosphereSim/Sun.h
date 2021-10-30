#pragma once
#include "SceneObject.h"

class Sun : public SceneObject
{

public:

	Sun(Mesh* _mesh, Shader* _shader) : SceneObject(_mesh, _shader) {
	}

	void exportData(Shader& shader) {
		glUniform3f(glGetUniformLocation(shader.ID, "sun.position"), position.x, position.y, position.z);
		glm::vec3 color = light->getDiffuse();
		glUniform3f(glGetUniformLocation(shader.ID, "sun.color"), color.x, color.y, color.z);
	}

};

