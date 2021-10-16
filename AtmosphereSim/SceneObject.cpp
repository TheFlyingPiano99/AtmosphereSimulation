#include "SceneObject.h"

void SceneObject::draw(Camera& camera)
{
	if (nullptr != mesh) {
		mesh->Draw(*shader, camera);
	}
}
