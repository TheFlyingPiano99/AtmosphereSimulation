#pragma once

#include "Mesh.h"
#include "shaderClass.h"
#include "Camera.h"

/*
* Abstract parent of all displayable objects
*/
class SceneObject
{
	Mesh* mesh = nullptr;		// Don't delete!
	Shader* shader = nullptr;	// Don't delete!

	//TODO

public:
	SceneObject(Mesh* _mesh = nullptr, Shader* _shader = nullptr) : mesh(_mesh), shader(_shader) {
	}

	~SceneObject() {
	}

	virtual void control() {}

	virtual void animate() {}

	virtual void draw(Camera& camera);

	void setMesh(Mesh* _mesh) {
		mesh = _mesh;
	}
	void setShader(Mesh* _shader) {
		mesh = _shader;
	}
};

