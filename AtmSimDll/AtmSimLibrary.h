#pragma once
#define ATMSIMLIBRARY_EXPORTS


#ifdef ATMSIMLIBRARY_EXPORTS
#define ATMSIMLIBRARY_API __declspec(dllexport)
#else
#define ATMSIMLIBRARY_API __declspec(dllimport)
#endif

#include <iostream>

extern "C" ATMSIMLIBRARY_API void run() {
	std::cout << "Hello dll!" << std::endl;

}