#pragma once

#include "Camera.h"
#include <vector>
#include "SceneObject.h"
#include "LightSource.h"

/*
* Singleton object
*/
class Scene
{
	static Scene* instance;

	Camera* camera;
	std::vector<SceneObject*> objects;
	std::vector<LightSource*> lights;
	std::vector<Mesh*> meshes;
	std::vector<Shader*> shaders;
	std::vector<Animation*> animations;


	Scene() {

	}

	void initCamera();
	void initMeshesShadersObjects();

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

