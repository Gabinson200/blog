---
title: "Intro to C++"
date: "2025-08-01"
tags: ["programming", "C++"]
links: []
---

## Why Learn C++?

C++ is a powerful, high‑performance programming language that forms the basis of many modern systems and games. It combines low‑level memory control with high‑level abstractions, making it ideal for applications where efficiency matters.

In this introductory article we'll explore the basic syntax of C++ and how to compile a simple program.

### Hello, World!

Here's the classic "Hello, World!" program in C++:

```
#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}
```

Save this code in a file called `hello.cpp` and compile it using your favourite C++ compiler:

```
g++ hello.cpp -o hello
./hello
```

You should see `Hello, World!` printed on your console.