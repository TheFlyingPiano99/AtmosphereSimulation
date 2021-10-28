#include "Callbacks.h"
#include "Scene.h"
#include "ControlActionManager.h"
#include "SingletonManager.h"
#include "GlobalInclude.h"

// Prevents the camera from jumping around when first clicking left click
bool firstClick = true;


void Callbacks::setCallbacks(GLFWwindow* window) {
	glfwSetWindowRefreshCallback(window, Callbacks::onWindowRefresh);
	glfwSetWindowCloseCallback(window, Callbacks::onWindowClose);
	glfwSetKeyCallback(window, Callbacks::onKey);
	glfwSetCursorPosCallback(window, Callbacks::onMouseMove);
}


void Callbacks::onWindowInit(GLFWwindow* window)
{
	glViewport(0, 0, windowWidth, windowHeight);
	glfwSetInputMode(window, GLFW_STICKY_KEYS, GLFW_TRUE);

	//TODO FrameBuffer

	glEnable(GL_DEPTH_TEST);

	Scene::getInstance()->init();
}


void Callbacks::onWindowRefresh(GLFWwindow* window)
{
	// Specify the color of the background
	glClearColor(0.07f, 0.13f, 0.17f, 1.0f);
	// Clean the back buffer and depth buffer
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);


	Scene::getInstance()->draw();

	glfwSwapBuffers(window);
}


void Callbacks::onKey(GLFWwindow* window, int key, int scancode, int action, int mods)
{
	ControlActionManager::getInstance()->onKey(key, scancode, action, mods);
}



void Callbacks::onMouseMove(GLFWwindow* window, double xpos, double ypos)
{
	// Handles mouse inputs
	if (glfwGetMouseButton(window, GLFW_MOUSE_BUTTON_LEFT) == GLFW_PRESS)
	{

		// Hides mouse cursor
		glfwSetInputMode(window, GLFW_CURSOR, GLFW_CURSOR_HIDDEN);

		// Prevents camera from jumping on the first click
		if (firstClick)
		{
			glfwSetCursorPos(window, (windowWidth / 2), (windowHeight / 2));
			firstClick = false;
		}

		// Stores the coordinates of the cursor
		double mouseX;
		double mouseY;
		// Fetches the coordinates of the cursor
		glfwGetCursorPos(window, &mouseX, &mouseY);


		Scene::getInstance()->getCamera()->rotate(mouseX, mouseY);


		// Sets mouse cursor to the middle of the screen so that it doesn't end up roaming around
		glfwSetCursorPos(window, (windowWidth / 2), (windowHeight / 2));
	}
	else if (glfwGetMouseButton(window, GLFW_MOUSE_BUTTON_LEFT) == GLFW_RELEASE)
	{
		// Unhides cursor since camera is not looking around anymore
		glfwSetInputMode(window, GLFW_CURSOR, GLFW_CURSOR_NORMAL);
		// Makes sure the next time the camera looks around it doesn't jump
		firstClick = true;
	}

}



void Callbacks::onWindowClose(GLFWwindow* window)
{
	// Delete all the objects we've created

	Singleton::destroyAllInstances();
}
