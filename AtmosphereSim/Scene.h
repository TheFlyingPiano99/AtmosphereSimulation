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

	Shader* shaderProgram = nullptr;
	Shader* lightShader = nullptr;

	Scene() {

	}
public:
	~Scene() {
		destroy();
	}

	static Scene* getInstance();
	static void destroyInstance();

	void init();
	void destroy();

	void control(float dt);
	void animate(float dt);
	void draw();

	Camera* getCamera();
};

