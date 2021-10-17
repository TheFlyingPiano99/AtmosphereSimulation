#include "ControlAction.h"

bool ControlAction::isThisAction(int key, int scancode, int action)
{
	return (this->key == key
		&& (
			(enableRepeat && (action == GLFW_PRESS || action == GLFW_REPEAT))
		|| (!enableRepeat && action == GLFW_PRESS)
			));
}

//---------------------------------------------------------------------------

void MoveCameraForward::execute(Scene* scene, float dt)
{
	Camera* camera = scene->getCamera();
	if (nullptr != camera) {
		camera->moveForward(dt);
	}
}

void MoveCameraBackward::execute(Scene* scene, float dt)
{
	Camera* camera = scene->getCamera();
	if (nullptr != camera) {
		camera->moveBackward(dt);
	}
}

void MoveCameraLeft::execute(Scene* scene, float dt)
{
	Camera* camera = scene->getCamera();
	if (nullptr != camera) {
		camera->moveLeft(dt);
	}
}

void MoveCameraRight::execute(Scene* scene, float dt)
{
	Camera* camera = scene->getCamera();
	if (nullptr != camera) {
		camera->moveRight(dt);
	}
}

void MoveCameraUp::execute(Scene* scene, float dt)
{
	Camera* camera = scene->getCamera();
	if (nullptr != camera) {
		camera->moveUp(dt);
	}
}

void MoveCameraDown::execute(Scene* scene, float dt)
{
	Camera* camera = scene->getCamera();
	if (nullptr != camera) {
		camera->moveDown(dt);
	}
}
