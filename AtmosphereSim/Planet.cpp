#include "Planet.h"

#include <vector>

#include "DualNumber.h"

#ifndef M_PI
	#define M_PI 3.14159265358979323846
#endif


Mesh* Planet::createMesh(float r)
{
	std::vector<Vertex> vertices;

	Dnum<glm::vec2> R = Dnum<glm::vec2>(r, glm::vec2(0, 0));
	Dnum<glm::vec2> N = Dnum<glm::vec2>(30, glm::vec2(0, 0));
	Dnum<glm::vec2> M = Dnum<glm::vec2>(30, glm::vec2(0, 0));
	Dnum<glm::vec2> PI = Dnum<glm::vec2>(M_PI, glm::vec2(0, 0));
	
	int vertIndex = 0;

	glm::vec3 colour = glm::vec3(1.0f, 0.5f, 0.3f);
	glm::vec2 texture = glm::vec2(0.0f, 0.0f);

	Dnum<glm::vec2> PHI = Dnum<glm::vec2>(0, glm::vec2(0, 0));
	Dnum<glm::vec2> THETA = Dnum<glm::vec2>(0, glm::vec2(0, 0));

	for (int i = 0; i < N.f; i++)
	{
		for (int j = 0; j < (M.f + 1) * 2; j++)
		{

			Dnum<glm::vec2> U = Dnum<glm::vec2>(i, glm::vec2(1, 0));
			Dnum<glm::vec2> V = Dnum<glm::vec2>(j, glm::vec2(0, 1));

			glm::vec3 pos;
			glm::vec3 normal;

			PHI = V / M * PI;
			THETA = U / N * PI;

			Dnum<glm::vec2> XPOS = Cos(PHI) * Sin(THETA) * R;
			Dnum<glm::vec2> YPOS = Sin(PHI) * Sin(THETA) * R;
			Dnum<glm::vec2> ZPOS = Cos(THETA) * R;

			pos = glm::vec3(XPOS.f, YPOS.f, ZPOS.f);

			glm::vec3 du, dv;
			du = glm::vec3(XPOS.d.x, YPOS.d.x, ZPOS.d.x);
			dv = glm::vec3(XPOS.d.y, YPOS.d.y, ZPOS.d.y);
			normal = cross(du, dv);

			texture = glm::vec2(PHI.f, THETA.f);

			Vertex vertex;
			vertex.position = pos;
			vertex.color= colour;
			vertex.normal = normal;
			vertex.texUV = texture;
			vertices.push_back(vertex);

			/*vtxData.push_back(GenVertexData((float)j / M, (float)i / N));
			vtxData.push_back(GenVertexData((float)j / M, (float)(i + 1) / N));*/

			/*VertexData vd;
			float phi = u * 2 * M_PI;
			float theta = v * M_PI;

			vd.normal = vec3(cosf(phi) * sinf(theta), sinf(phi) * sinf(theta), cosf(theta));
			vd.position = vd.normal * r;

			return vd;*/
		}
	}

	std::vector<GLuint> indices;

	for (GLuint i = 2; i < N.f * M.f; i++)
	{
		indices.push_back(i - 2);
		indices.push_back(i - 1);
		indices.push_back(i);
	}

	std::vector<Texture> tex;

	return new Mesh(vertices, indices, tex);
}

Planet::Planet(Shader* _shader) : SceneObject(nullptr, _shader) {
	planetRadius = 3.0f;
	this->mesh = createMesh(planetRadius);
	atmosphere.center = position;
	atmosphere.radius = 6.0f;

	atmosphere.quadraticAbsorption = glm::vec3(0.2, 5.0, 6.0);
	atmosphere.linearAbsorption = glm::vec3(1, 1, 1);
	atmosphere.constantAbsorption = glm::vec3(1, 1, 1);

	atmosphere.quadraticScattering = glm::vec3(0.14, 0.15, 0.15);
	atmosphere.linearScattering = glm::vec3(0.001, 0.1, 0.4);
	atmosphere.constantScattering = glm::vec3(0.0, 0.5, 1);

	atmosphere.quadraticReflectiveness = glm::vec3(0.8, 0.8, 0.8);
	atmosphere.linearReflectiveness = glm::vec3(0.1, 0.1, 0.8);
	atmosphere.constantReflectiveness = glm::vec3(1, 1, 1);

	atmosphere.quadraticDensity = 0.1f;
	atmosphere.linearDensity = 0.5f;
	atmosphere.constantDensity = 0.0f;
}

void Planet::exportAtmosphere(Shader& shader) {
	glUniform3f(glGetUniformLocation(shader.ID, "atmosphere.center"), atmosphere.center.x, atmosphere.center.y, atmosphere.center.z);
	glUniform1f(glGetUniformLocation(shader.ID, "atmosphere.radius"), atmosphere.radius);
	glUniform1f(glGetUniformLocation(shader.ID, "atmosphere.planetRadius"), planetRadius);

	glUniform3f(glGetUniformLocation(shader.ID, "atmosphere.quadraticAbsorption"), atmosphere.quadraticAbsorption.x, atmosphere.quadraticAbsorption.y, atmosphere.quadraticAbsorption.z);
	glUniform3f(glGetUniformLocation(shader.ID, "atmosphere.linearAbsorption"), atmosphere.linearAbsorption.x, atmosphere.linearAbsorption.y, atmosphere.linearAbsorption.z);
	glUniform3f(glGetUniformLocation(shader.ID, "atmosphere.constantAbsorption"), atmosphere.constantAbsorption.x, atmosphere.constantAbsorption.y, atmosphere.constantAbsorption.z);

	glUniform3f(glGetUniformLocation(shader.ID, "atmosphere.quadraticScattering"), atmosphere.quadraticScattering.x, atmosphere.quadraticScattering.y, atmosphere.quadraticScattering.z);
	glUniform3f(glGetUniformLocation(shader.ID, "atmosphere.linearScattering"), atmosphere.linearScattering.x, atmosphere.linearScattering.y, atmosphere.linearScattering.z);
	glUniform3f(glGetUniformLocation(shader.ID, "atmosphere.constantScattering"), atmosphere.constantScattering.x, atmosphere.constantScattering.y, atmosphere.constantScattering.z);

	glUniform3f(glGetUniformLocation(shader.ID, "atmosphere.quadratiReflectiveness"), atmosphere.quadraticReflectiveness.x, atmosphere.quadraticReflectiveness.y, atmosphere.quadraticReflectiveness.z);
	glUniform3f(glGetUniformLocation(shader.ID, "atmosphere.linearReflectiveness"), atmosphere.linearReflectiveness.x, atmosphere.linearReflectiveness.y, atmosphere.linearReflectiveness.z);
	glUniform3f(glGetUniformLocation(shader.ID, "atmosphere.constantReflectiveness"), atmosphere.constantReflectiveness.x, atmosphere.constantReflectiveness.y, atmosphere.constantReflectiveness.z);

	glUniform1f(glGetUniformLocation(shader.ID, "atmosphere.quadratiDensity"), atmosphere.quadraticDensity);
	glUniform1f(glGetUniformLocation(shader.ID, "atmosphere.linearDensity"), atmosphere.linearDensity);
	glUniform1f(glGetUniformLocation(shader.ID, "atmosphere.constantDensity"), atmosphere.constantDensity);
}

float* Planet::getQuadraticDensity()
{
	return &(atmosphere.quadraticDensity);
}

float* Planet::getLinearDensity()
{
	return &(atmosphere.linearDensity);
}

float* Planet::getConstantDensity()
{
	return &(atmosphere.constantDensity);
}


glm::vec3* Planet::getQuadraticAbsorption()
{
	return &(atmosphere.quadraticAbsorption);
}

glm::vec3* Planet::getLinearAbsorption()
{
	return &(atmosphere.linearAbsorption);
}

glm::vec3* Planet::getConstantAbsorption()
{
	return &(atmosphere.constantAbsorption);
}


glm::vec3* Planet::getQuadraticScattering()
{
	return &(atmosphere.quadraticScattering);
}

glm::vec3* Planet::getLinearScattering()
{
	return &(atmosphere.linearScattering);
}

glm::vec3* Planet::getConstantScattering()
{
	return &(atmosphere.constantScattering);
}


glm::vec3* Planet::getQuadraticReflectiveness()
{
	return &(atmosphere.quadraticReflectiveness);
}

glm::vec3* Planet::getLinearReflectiveness()
{
	return &(atmosphere.linearReflectiveness);
}

glm::vec3* Planet::getConstantReflectiveness()
{
	return &(atmosphere.constantReflectiveness);
}