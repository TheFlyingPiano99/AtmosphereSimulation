#include "SingletonManager.h"

#include "ControlActionManager.h"
#include "Scene.h"

/*
* Needs to be called before closing program!
*/
void Singleton::destroyAllInstances() {
	ControlActionManager::destroyInstance();
	Scene::destroyInstance();
}
