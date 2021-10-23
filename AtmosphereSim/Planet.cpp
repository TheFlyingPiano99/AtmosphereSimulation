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