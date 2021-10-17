#pragma once

#include "Mesh.h"
#include "shaderClass.h"
#include "Camera.h"
#include "LightSource.h"

/*
* Abstract parent of all displayable objects
*/
class SceneObject
{
	Mesh* mesh = nullptr;		// Don't delete!
	Shader* shader = nullptr;	// Don't delete!

	glm::vec3 Position;

	float speed;	// Temporary
	LightSource* light = nullptr;	// NULL if no light source

	glm::mat4 modelMatrix = glm::mat4(1.0f);


	/*
	* Exports model matrix into shader uniform
	*/
	void exportMatrix(const char* uniform);

public:
	SceneObject(Mesh* _mesh = nullptr, Shader* _shader = nullptr) : mesh(_mesh), shader(_shader) {
	}

	~SceneObject() {
	}

	void updateMatrix();

	void setSpeed(float s) {
		speed = s;
	}
	void setLight(LightSource* _light) {
		light = _light;
	}

	virtual void control(float dt) {}

	virtual void animate(float dt);

	virtual void draw(Camera& camera);

	void setMesh(Mesh* _mesh) {
		mesh = _mesh;
	}
	void setShader(Mesh* _shader) {
		mesh = _shader;
	}

};

