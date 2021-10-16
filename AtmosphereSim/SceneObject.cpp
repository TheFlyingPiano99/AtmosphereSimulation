#include "SceneObject.h"

void SceneObject::draw(Shader& shader, Camera& camera)
{
	if (nullptr != mesh) {
		mesh->Draw(shader, camera);
	}
}
