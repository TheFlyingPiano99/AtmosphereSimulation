#pragma once
#include<glad/glad.h>
#include<GLFW/glfw3.h>

namespace Callbacks
{
	void setCallbacks(GLFWwindow* window);

	static void onWindowInit(GLFWwindow* window);
	static void onWindowRefresh(GLFWwindow* window);
	static void onWindowClose(GLFWwindow* window);
};

