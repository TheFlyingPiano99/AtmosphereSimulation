#include "SceneObject.h"

inline void SceneObject::updateMatrix() {
	modelMatrix = glm::mat4(1.0f);
	modelMatrix = glm::translate(Position);
}

void SceneObject::animate(float dt)
{
	static float t = 0.0;
	t += dt;
	float r = 2.0f;
	glm::vec3 pos = glm::vec3(r * sin(speed * t * 0.0001f), 1.0, r * cos(speed * t * 0.0001f));
	if (speed > 0.0) {
		Position = pos;
	}
	if (light != nullptr) {
		light->setPosition(Position);
	}
	updateMatrix();
}

void SceneObject::draw(Camera& camera)
{
	if (nullptr != mesh && nullptr != shader) {
		shader->Activate();
		exportMatrix("model");
		mesh->Draw(*shader, camera);
	}
}

void SceneObject::exportMatrix(const char* uniform)
{
	glUniformMatrix4fv(glGetUniformLocation(shader->ID, uniform), 1, GL_FALSE, glm::value_ptr(modelMatrix));
}
