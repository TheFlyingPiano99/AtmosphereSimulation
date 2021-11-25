#pragma once
#include "SceneObject.h"

class Sun : public SceneObject
{


	Mesh* createMesh(float radius);
	void generateIcosaFace(glm::vec3 a, glm::vec3 b, glm::vec3 c, int resolution, float r, std::vector<glm::vec3>* vertices, std::vector<GLuint>* indices);

public:

	Sun(Shader* _shader) : SceneObject(nullptr, _shader) {
		mesh = createMesh(0.2f);
	}

	void exportData(Shader& shader) {
		glUniform3f(glGetUniformLocation(shader.ID, "sun.position"), position.x, position.y, position.z);
		glm::vec3 color = light->getDiffuse();
		glUniform3f(glGetUniformLocation(shader.ID, "sun.color"), color.x, color.y, color.z);
	}


};

