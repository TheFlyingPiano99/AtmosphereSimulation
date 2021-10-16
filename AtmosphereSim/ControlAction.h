#pragma once

#include "Scene.h"
#include <queue>
#include <GLFW/glfw3.h>

class ControlAction
{
	int key;
	int action;

public:
	ControlAction(int _key, int _action = GLFW_PRESS) : key(_key), action(_action) {
	}

	bool isThisAction(int key, int scancode, int action);

	virtual void execute(Scene* scene, float dt) = 0;
};

class MoveCameraForward : public ControlAction {
public:
	MoveCameraForward() : ControlAction(GLFW_KEY_W) {

	}

	void execute(Scene* scene, float dt) override;
};

class MoveCameraBackward : public ControlAction {
public:
	MoveCameraBackward() : ControlAction(GLFW_KEY_S) {
	}

	void execute(Scene* scene, float dt) override;
};

class MoveCameraLeft : public ControlAction {
public:
	MoveCameraLeft() : ControlAction(GLFW_KEY_A) {
	}

	void execute(Scene* scene, float dt) override;
};

class MoveCameraRight : public ControlAction {
public:
	MoveCameraRight() : ControlAction(GLFW_KEY_D) {
	}

	void execute(Scene* scene, float dt) override;
};

class MoveCameraUp : public ControlAction {
public:
	MoveCameraUp() : ControlAction(GLFW_KEY_SPACE) {
	}

	void execute(Scene* scene, float dt) override;
};

class MoveCameraDown : public ControlAction {
public:
	MoveCameraDown() : ControlAction(GLFW_KEY_LEFT_CONTROL) {
	}

	void execute(Scene* scene, float dt) override;
};
