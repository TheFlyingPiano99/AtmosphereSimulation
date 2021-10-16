#pragma once

#include "Mesh.h"
#include "shaderClass.h"
#include "Camera.h"

/*
* Abstract parent of all displayable objects
*/
class SceneObject
{
	Mesh* mesh;
	
	//TODO

public:
	SceneObject(Mesh* _mesh = nullptr) : mesh(_mesh) {
	}

	~SceneObject() {
		if (nullptr != mesh) {
			delete mesh;
		}
	}

	virtual void control() {}

	virtual void animate() {}

	virtual void draw(Shader& shader, Camera& camera);

	void setMesh(Mesh* _mesh) {
		mesh = _mesh;
	}
};

