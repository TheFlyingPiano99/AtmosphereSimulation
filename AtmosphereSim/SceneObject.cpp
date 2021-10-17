#include "SceneObject.h"

inline void SceneObject::updateMatrix() {
	modelMatrix = glm::mat4(1.0f);
	modelMatrix = glm::translate(Position);
}

void SceneObject::animate(float dt)
{
	if (nullptr != animation) {
		animation->perform(this, dt);
		if (light != nullptr) {
			light->setPosition(Position);
		}
		updateMatrix();
	}
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
