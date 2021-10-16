#include "Scene.h"
#include "GlobalInclude.h"

Scene* Scene::instance = nullptr;

Scene* Scene::getInstance()
{
    if (instance == nullptr) {
        instance = new Scene();
    }
    return instance;
}

void Scene::destroyInstance()
{
    if (instance != nullptr) {
        delete instance;
        instance = nullptr;
    }
}

void Scene::init()
{
    // Creates camera object
    camera= new Camera(windowWidth, windowHeight, glm::vec3(0.0f, 0.0f, 2.0f));


}

void Scene::destroy()
{
    if (camera != nullptr) {
        delete camera;
        camera = nullptr;
    }

    for (auto obj : objects) {
        delete obj;
    }
    objects.clear();
}
