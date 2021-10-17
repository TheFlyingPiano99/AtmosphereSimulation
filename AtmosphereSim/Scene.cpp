#include "Scene.h"
#include "GlobalInclude.h"
#include "ControlActionManager.h"
#include "AssetManager.h"

#include "TestObject.h"

//------- Ignore this ----------
#include<filesystem>
namespace fs = std::filesystem;
//------------------------------


// Vertices coordinates
Vertex vertices[] =
{ //               COORDINATES           /            COLORS          /           TexCoord         /       NORMALS         //
	Vertex{glm::vec3(-1.0f, 0.0f,  1.0f), glm::vec3(0.0f, 1.0f, 0.0f), glm::vec3(1.0f, 1.0f, 1.0f), glm::vec2(0.0f, 0.0f)},
	Vertex{glm::vec3(-1.0f, 0.0f, -1.0f), glm::vec3(0.0f, 1.0f, 0.0f), glm::vec3(1.0f, 1.0f, 1.0f), glm::vec2(0.0f, 1.0f)},
	Vertex{glm::vec3(1.0f, 0.0f, -1.0f), glm::vec3(0.0f, 1.0f, 0.0f), glm::vec3(1.0f, 1.0f, 1.0f), glm::vec2(1.0f, 1.0f)},
	Vertex{glm::vec3(1.0f, 0.0f,  1.0f), glm::vec3(0.0f, 1.0f, 0.0f), glm::vec3(1.0f, 1.0f, 1.0f), glm::vec2(1.0f, 0.0f)}
};

// Indices for vertices order
GLuint indices[] =
{
	0, 1, 2,
	0, 2, 3
};

Vertex lightVertices[] =
{ //     COORDINATES     //
	Vertex{glm::vec3(-0.1f, -0.1f,  0.1f)},
	Vertex{glm::vec3(-0.1f, -0.1f, -0.1f)},
	Vertex{glm::vec3(0.1f, -0.1f, -0.1f)},
	Vertex{glm::vec3(0.1f, -0.1f,  0.1f)},
	Vertex{glm::vec3(-0.1f,  0.1f,  0.1f)},
	Vertex{glm::vec3(-0.1f,  0.1f, -0.1f)},
	Vertex{glm::vec3(0.1f,  0.1f, -0.1f)},
	Vertex{glm::vec3(0.1f,  0.1f,  0.1f)}
};

GLuint lightIndices[] =
{
	0, 1, 2,
	0, 2, 3,
	0, 4, 7,
	0, 7, 3,
	3, 7, 6,
	3, 6, 2,
	2, 6, 5,
	2, 5, 1,
	1, 5, 4,
	1, 4, 0,
	4, 5, 6,
	4, 6, 7
};


Scene* Scene::instance = nullptr;

void Scene::initCamera()
{
	camera = new Camera(windowWidth, windowHeight, glm::vec3(0.0f, 0.2f, 2.0f));
}

void Scene::initMeshesShadersObjects()
{
	/*
* I'm doing this relative path thing in order to centralize all the resources into one folder and not
* duplicate them between tutorial folders. You can just copy paste the resources from the 'Resources'
* folder and then give a relative path from this folder to whatever resource you want to get to.
* Also note that this requires C++17, so go to Project Properties, C/C++, Language, and select C++17
*/


	// Texture data
	Texture textures[]
	{
		Texture((AssetManager::getInstance()->getTextureFolderPath().append("/planks.png") ).c_str(), "diffuse", 0, GL_RGBA, GL_UNSIGNED_BYTE),
		Texture((AssetManager::getInstance()->getTextureFolderPath().append("/planksSpec.png")).c_str(), "specular", 1, GL_RED, GL_UNSIGNED_BYTE)
	};

	// Generates Shader object using shaders default.vert and default.frag
	// Store mesh data in vectors for the mesh
	std::vector <Vertex> verts(vertices, vertices + sizeof(vertices) / sizeof(Vertex));
	std::vector <GLuint> ind(indices, indices + sizeof(indices) / sizeof(GLuint));
	std::vector <Texture> tex(textures, textures + sizeof(textures) / sizeof(Texture));

	std::vector <Vertex> lightVerts(lightVertices, lightVertices + sizeof(lightVertices) / sizeof(Vertex));
	std::vector <GLuint> lightInd(lightIndices, lightIndices + sizeof(lightIndices) / sizeof(GLuint));

	glm::vec4 lightColor = glm::vec4(1.0f, 1.0f, 1.0f, 1.0f);
	glm::vec3 lightPos = glm::vec3(0.5f, 0.5f, 0.5f);
	glm::mat4 lightModel = glm::mat4(1.0f);
	lightModel = glm::translate(lightModel, lightPos);

	lights.push_back(new LightSource(lightColor, 10, lightPos));

	glm::vec3 objectPos = glm::vec3(0.0f, 0.0f, 0.0f);
	glm::mat4 objectModel = glm::mat4(1.0f);
	objectModel = glm::translate(objectModel, objectPos);

	Shader* shaderProgram = new Shader("default.vert", "default.frag");
	Shader* lightShader = new Shader("light.vert", "light.frag");
	shaders.push_back(shaderProgram);
	shaders.push_back(lightShader);

	animations.push_back(new GoAround(1.5f, 0.0005f, glm::vec3(0, 0.3f, 0)));

	//Objects:
	Mesh* floorMesh = new Mesh(verts, ind, tex);
	meshes.push_back(floorMesh);
	objects.push_back(new SceneObject(floorMesh, shaderProgram));

	Mesh* lightMesh = new Mesh(lightVerts, lightInd, tex);
	meshes.push_back(lightMesh);
	SceneObject* lightObj = new SceneObject(lightMesh, lightShader);
	lightObj->setLight(lights[0]);
	lightObj->setAnimation(animations[0]);
	objects.push_back(lightObj);

}

Scene* Scene::getInstance()
{
    if (instance == nullptr) {
        instance = new Scene();
    }
    return instance;
}

void Scene::destroyInstance()
{
    if (instance != nullptr) {
        delete instance;
        instance = nullptr;
    }
}

void Scene::init()
{
	// Set control layout
	ControlActionManager::getInstance()->registerDefault();

	initCamera();
	initMeshesShadersObjects();
}

void Scene::destroy()
{
	if (camera != nullptr) {
		delete camera;
		camera = nullptr;
	}

	for (auto obj : objects) {
		delete obj;
	}
	objects.clear();

	for (auto lg : lights) {
		delete lg;
	}
	lights.clear();

	for (auto me : meshes) {
		delete me;
	}
	meshes.clear();

	for (auto sh : shaders) {
		sh->Delete();
		delete sh;
	}
	shaders.clear();

	for (auto anim : animations) {
		delete anim;
	}
	animations.clear();
}

//-----------------------------------------------------------------------------

void Scene::control(float dt)
{
    ControlActionManager::getInstance()->executeQueue(this, dt);

	for (auto obj : objects) {
		obj->control(dt);
	}
	for (auto lg : lights) {
		lg->control(dt);
	}
}

void Scene::animate(float dt)
{
	for (auto obj : objects) {
		obj->animate(dt);
	}
	for (auto lg : lights) {
		lg->animate(dt);
	}
}

void Scene::draw()
{
	camera->updateMatrix(45.0f, 0.1f, 100.0f);
	for (auto lg : lights) {
		for (auto sh : shaders) {
			lg->exportData(sh);
		}
	}
    for (auto obj : objects) {
		obj->draw(*camera);
	}
}

Camera* Scene::getCamera() {
    return camera;
}
