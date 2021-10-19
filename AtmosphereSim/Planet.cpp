#include "Planet.h"

#include <vector>

#ifndef M_PI
	#define M_PI 3.14159265358979323846
#endif


Mesh* createMesh(float r)
{
	std::vector<Vertex> vertices;

	int N = 30;
	int M = 30;

	int vertIndex = 0;

	glm::vec3 colour = glm::vec3(1.0f, 0.5f, 0.3f);
	glm::vec3 texture = glm::vec3(0.0f, 0.0f, 0.0f);

	float phi;
	float theta;

	for (int i = 0; i < N; i++)
	{
		for (int j = 0; j < (M + 1) * 2; j++)
		{
			// Nor used rn could be used in the future
			//glm::vec3 colour = glm::vec3(1.0f, 0.5f, 0.3f);
			//glm::vec3 texture = glm::vec3(0.0f, 0.0f, 0.0f);

			glm::vec3 pos;
			glm::vec3 normal;

			phi = ((float)j / M) * M_PI;
			theta = ((float)i / N) * M_PI;

			pos = glm::vec3(cosf(phi) * sinf(theta), sinf(phi) * sinf(theta), cosf(theta)) * r;
			normal = pos / r;

			vertices.push_back(Vertex{ pos, colour, texture, normal});

			phi = ((float)j / M) * M_PI;
			theta = ((float)(i + 1) / N) * M_PI;

			pos = glm::vec3(cosf(phi) * sinf(theta), sinf(phi) * sinf(theta), cosf(theta)) * r;
			normal = pos / r;

			vertices.push_back(Vertex{pos, colour, texture, normal });

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

	for (GLuint i = 2; i < N * M; i++)
	{
		indices.push_back(i - 2);
		indices.push_back(i - 1);
		indices.push_back(i);
	}

	std::vector<Texture> tex;

	return new Mesh(vertices, indices, tex);
}