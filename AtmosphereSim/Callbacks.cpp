#include "Callbacks.h"

void Callbacks::setCallbacks(GLFWwindow* window) {
	glfwSetWindowRefreshCallback(window, Callbacks::onWindowRefresh);
	glfwSetWindowCloseCallback(window, Callbacks::onWindowClose);
}

void Callbacks::onWindowInit(GLFWwindow* window)
{
}

void Callbacks::onWindowRefresh(GLFWwindow* window)
{
	//TODO
}

void Callbacks::onWindowClose(GLFWwindow* window)
{
}
