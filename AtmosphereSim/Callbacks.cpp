#include "Callbacks.h"
#include "Scene.h"

void Callbacks::setCallbacks(GLFWwindow* window) {
	glfwSetWindowRefreshCallback(window, Callbacks::onWindowRefresh);
	glfwSetWindowCloseCallback(window, Callbacks::onWindowClose);
}

void Callbacks::onWindowInit(GLFWwindow* window)
{
	Scene::getInstance();
}

void Callbacks::onWindowRefresh(GLFWwindow* window)
{

}

void Callbacks::onWindowClose(GLFWwindow* window)
{
	Scene::destroyInstance();
}

void Callbacks::handleInputs(GLFWwindow* window)
{
	//TODO
}
