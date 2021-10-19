#pragma once

#include<string>

#include "VBO.h"
#include "Mesh.h"

class Planet
{
	//Mesh* planetMesh;

public:

	Planet();

	Mesh* createMesh(float r);
};