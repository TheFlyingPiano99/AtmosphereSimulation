#pragma once

#include<string>

#include "VBO.h"
#include "Mesh.h"
#include "SceneObject.h"

class Planet : public SceneObject
{

	Mesh* createMesh(float r);

public:

	Planet(Shader* _shader): SceneObject(nullptr, _shader) {
		this->mesh = createMesh(1.0f);
	}

};
