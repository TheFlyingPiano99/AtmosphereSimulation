#pragma once

#include <vector>
#include<glm/glm.hpp>
#include "SceneObject.h"
#include "LightSource.h"
#include "PostprocessUnit.h"
#include "Camera.h"


/*
* Singleton object
*/
class Scene
{
	static Scene* instance;

	glm::vec4 backgroundColor = glm::vec4(0.07f, 0.13f, 0.17f, 1.0f);
	Camera* camera;
	std::vector<SceneObject*> objects;
	std::vector<LightSource*> lights;
	std::vector<Mesh*> meshes;
	std::vector<Shader*> objectShaders;
	std::vector<Animation*> animations;
	PostprocessUnit postprocessUnit;

	Planet* planet;
	Sun* sun;

	Scene() {

	}

	void initCamera();
	void initMeshesShadersObjects();
	void initGUI();

	void preDrawInit();


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

	Planet* getPlanet();

	Camera* getCamera();
};

