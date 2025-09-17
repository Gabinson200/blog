---
title: "Understanding Pointers"
date: "2025-08-20"
tags: ["programming", "C++", "pointers"]
links: ["variables-and-types"]
---

## What Are Pointers?

Pointers are variables that hold memory addresses. They allow you to refer to other variables indirectly and are a powerful feature of C++, enabling dynamic memory management and efficient data structures.

### Declaring and Using Pointers

```
int value = 42;
int* ptr = &value; // ptr holds the address of value

std::cout << "value = " << value << std::endl;      // prints 42
std::cout << "*ptr = " << *ptr << std::endl;        // prints 42 (dereferencing)

*ptr = 100; // modify value through pointer
std::cout << "value = " << value << std::endl;      // now prints 100
```

Understanding how pointers work is essential for tasks such as dynamic memory allocation (`new`/`delete`), implementing linked data structures and interfacing with low‑level APIs.