#pragma once

#include "Camera.h"
#include <vector>
#include "SceneObject.h"

/*
* Singleton object
*/
class Scene
{
	static Scene* instance;

	Camera* camera;
	std::vector<SceneObject*> objects;

	Scene() {

	}
	~Scene() {
		destroy();
	}
public:

	static Scene* getInstance();
	static void destroyInstance();

	void init();
	void destroy();

	void control(float dt);
	void animate(float dt);
	void draw();
};

