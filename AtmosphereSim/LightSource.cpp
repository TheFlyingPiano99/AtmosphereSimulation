#include "LightSource.h"

void LightSource::control(float dt)
{
}

void LightSource::animate(float dt)
{
}

void LightSource::exportData(Shader* shader)
{
	shader->Activate();
	glUniform4f(glGetUniformLocation(shader->ID, "lightColor"), color.x, color.y, color.z, color.w);
	glUniform1f(glGetUniformLocation(shader->ID, "lightIntensity"), intensity);
	glUniform3f(glGetUniformLocation(shader->ID, "lightPos"), Position.x, Position.y, Position.z);
}
