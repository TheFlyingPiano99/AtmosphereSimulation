#include "PostprocessUnit.h"
#include "GlobalInclude.h"

float rectangleVertices[] =
{
	//Coord	//texCoords
	1.0f, -1.0f,  1.0f,  0.0f,
   -1.0f, -1.0f,  0.0f,  0.0f,
   -1.0f,  1.0f,  0.0f,  1.0f,

	1.0f,  1.0f,  1.0f,  1.0f,
	1.0f, -1.0f,  1.0f,  0.0f,
   -1.0f,  1.0f,  0.0f,  1.0f
};


void PostprocessUnit::init() {
	shader = new Shader("postprocess.vert", "postprocess.frag");
	shader->Activate();

	glGenVertexArrays(1, &rectVAO);
	glGenBuffers(1, &rectVBO);
	glBindVertexArray(rectVAO);
	glBindBuffer(GL_ARRAY_BUFFER, rectVBO);
	glBufferData(GL_ARRAY_BUFFER, sizeof(rectangleVertices), &rectangleVertices, GL_STATIC_DRAW);
	glEnableVertexAttribArray(0);
	glVertexAttribPointer(0, 2, GL_FLOAT, GL_FALSE, 4 * sizeof(float), (void*)0);
	glEnableVertexAttribArray(1);
	glVertexAttribPointer(1, 2, GL_FLOAT, GL_FALSE, 4 * sizeof(float), (void*)(2 * sizeof(float)));

	glGenFramebuffers(1, &FBO);
	glBindFramebuffer(GL_FRAMEBUFFER, FBO);

	glGenTextures(1, &framebufferTexture);
	glBindTexture(GL_TEXTURE_2D, framebufferTexture);
	glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, windowWidth, windowHeight, 0, GL_RGB, GL_UNSIGNED_BYTE, NULL);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
	glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, framebufferTexture, 0);
	glUniform1i(glGetUniformLocation(shader->ID, "screenTexture"), framebufferTexture);

	glGenRenderbuffers(1, &RBO);
	glBindRenderbuffer(GL_RENDERBUFFER, RBO);
	glRenderbufferStorage(GL_RENDERBUFFER, GL_DEPTH24_STENCIL8, windowWidth, windowHeight);
	glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_DEPTH_STENCIL_ATTACHMENT, GL_RENDERBUFFER, RBO);

	auto fboStatus = glCheckFramebufferStatus(GL_FRAMEBUFFER);
	if (fboStatus != GL_FRAMEBUFFER_COMPLETE)
		std::cout << "Framebuffer error: " << fboStatus << std::endl;
}

void PostprocessUnit::preDrawInit(const glm::vec4& backgroundColor)
{
	glBindFramebuffer(GL_FRAMEBUFFER, FBO);
	glClearColor(backgroundColor.x, backgroundColor.y, backgroundColor.z, backgroundColor.w);
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

	glUniform1i(glGetUniformLocation(shader->ID, "windowWidth"), windowWidth);
	glUniform1i(glGetUniformLocation(shader->ID, "windowHeight"), windowHeight);
}

void PostprocessUnit::render(Camera& camera, Planet& planet, Sun& sun)
{
	shader->Activate();

	camera.exportPostprocessData(*shader);
	planet.exportAtmosphere(*shader);
	sun.exportData(*shader);

	glBindFramebuffer(GL_FRAMEBUFFER, 0);
	glBindVertexArray(rectVAO);
	glDisable(GL_DEPTH_TEST);
	glBindTexture(GL_TEXTURE_2D, framebufferTexture);
	glDrawArrays(GL_TRIANGLES, 0, 6);
}

Shader* PostprocessUnit::getShader()
{
	return shader;
}
