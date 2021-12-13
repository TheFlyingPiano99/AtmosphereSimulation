#version 330 core

out vec4 FragColor;

uniform vec3 lightColor;

void main()
{
	FragColor = vec4(vec3(10000, 10000, 10000), 1.0f);
}