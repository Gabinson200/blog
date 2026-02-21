# Bit packing and fun with boolean operator

Here are some useful and fun bitwise operations you can do on your binary data.

## Binary Operators

Before getting into anything specific lets review the set of operations available to us and their interpretation:

### >> and <<

The `>>` rightshift and `<<` leftshift operators shift the position of all the bits in the data left or right by some position. 

ex:
`x = 1001 1011` `x <<= 1 == 0011 0110` and `x >>= 2 == 0010 0110`
Depending on the data type of `x` the effect of the bitshift can be interpreted in several ways:
- if no `1`s in the data over or underflow then a shift represents a divide or multiply by 2 depending on the direction of the shift and the endianess of the data.
- if the data is a signed type then when the bitshift can cause the most significant bit representing the sign of the data to switch. 

### & bitwise AND
The `&` symbol performs a bitwise AND between two variables. 
`x = 1001 1011` `y = 0111 0101` then `x & y == 0001 0001`

The bitwise AND is most commonly used with bit masks to extract / test bits. For example a test to see if the bit at position `i` of variable `x` is on is: `if (x & (1u << k)) {...}` 

### | bitwise OR
The `|` symbol performs a bitwise OR between two variables.
`x = 1001 1011` `y = 0111 0101` then `x | y == 1111 1111`

The bitwise OR is usually used with bitmasks to turn on bit(s):
`x |= (1u << i);`  turns on the `i`th bit. `x |= mask` turns on all the bits in `x` that are also on in the `mask`.

### ^ bitwise XOR
The `^` symbol performs an exclusive OR on the bits. This has the effect of toggling the desired bit; turning it on if its off and turning it off if its on: `x |= (1u << i);` toggles the `i`th bit.

A interesting dual attribute of this operation is that `x^x = 0` and `x^x^x == x` aka double toggling returns the variable to its original state. Using this attribute you can swap two variables without using a temporary variable: `a ^= b; b ^= a; a ^= b;`

You can also use the XOR to see what changed between two variables:
`uint changed = old ^ new` then you can check what changed by doing `if(changed & (1u << i)) { /* bit i changed*/}`

### ~ bitwise NOT
The `~` symbol performs a bitwise NOT and clears the specified bit(s).
`x &= ~(1u << i)` clears the i'th bit.

Now that we know the operations available to us lets see how we can use them on different data types.

## Flag toggles

Using bitwise operations and masks we can store, manipulate and query a set of boolean values stored as an unsigned integer.
For example if I have data for some message / packet that I want to attach some information that represents the ability to read, write, or execute ... etc, I can append a set of header bits where different position in the header bitset represent the permissions for the data.  

```cpp
enum Flags : uint16_t { Read=1<<0, Write=1<<1, Exec=1<<2 };

uint16_t header = 0;            // clear header
header |= Read | Write;         // set read and write flags
header &= ~Write;               // clear the write flag
bool canExec = (header & Exec); // test if exec flag is on
header ^= Read;                 // toggle the read flag
```


## Bitpacking

Depending on your data you might want to store several smaller sized chunks of data together because they are conceptually related. This also allows for some space saving since if you know the possible range of values your data can take you can allocate the minimum amount of bits needed to represent it and then pack it along similar data. For example the color format RGB565 allocates 5 bits to represent the red and blue values in a pixel and 6 bits to represent the green values. This was designed so that a single pixel color can be specified as a combination of red/green/blue values in a single `uint16_t`. Furthermore, the green channel was assigned the extra bit because the human eye is more sensitive to green than any other color. 

```cpp

uint16_t color = 0; // 0x0000 clear color bits (represents black)
// uint16_t color = 0xFFFF; setting all bits to 1, represents white

// Pack color with R,G, and B
uint16_t R, G, B;
 // ANDing with 0x1F makes sure only the first 5 bits are considered 
color |= ((R & 0x1F) << 11);
 // ANDing with 0x3F makes sure only the first 6 bits are considered 
color |= ((G & 0x3F) << 5); 
color |= (B & 0x1F); 

// you can turn this into a general usage function like:
#include <cstdint>

struct RGB565 {
    uint16_t r = 0;  // 0..31
    uint16_t g = 0;  // 0..63
    uint16_t b = 0;  // 0..31
};

inline uint16_t pack_rgb565(RGB565 c = {}) {
    return (uint16_t)(((c.r & 0x1F) << 11) | // 0x1F is the 
                      ((c.g & 0x3F) << 5)  |
                      ((c.b & 0x1F) << 0));
}

// You can also use macros although they are not advised because of ability to shoot your dick off using them
// this code assumes the color and channels are in uin16_t
#define RGB565_R(c)  (((c) & 0xF800) >> 11)
#define RGB565_G(c)  (((c) & 0x07E0) >> 5)
#define RGB565_B(c)  (((c) & 0x001F))
#define PACK_RGB565_FAST(r, g, b) ((((r) & 0x1F) << 11) | (((g) & 0x3F) << 5) | ((b) & 0x1F))

```

We can apply the same technique to store UV values for textures as a single `uint32_t` composed of two `uint16_t`s.

```cpp
uint32_t UV = 0;
uint16_t u, v;

inline uint32_t pack_uv(uint16_t u, uint16_t v) {
    return (uint32_t(u) << 16) | uint32_t(v);
}

inline void unpack_uv(uint32_t uv, uint16_t& u, uint16_t& v) {
    u = uint16_t(uv >> 16);
    v = uint16_t(uv & 0xFFFFu);
}
```

## Iteration and Indexing
If you have some data or data-structure that can be iterated over with values that change in terms of powers of 2 you can also apply bitshifts to possibly optimize iteration and indexing. Some examples include:

- Mipmaps: each level is the previous divided by 2 thus stepping down  `i` levels can be expressed as: `w >>= i; h >>= 1;`

- Radix sort with base of $2^k$: digit extraction becomes: `digit = (x >> shift) & ((1<<i)-1)`

- Ring buffer wrapping: if buffer size is power fo 2 we can wrap indices by `idx = (idx + 1) & (size - 1);` instead of using modulo operator `%`.

## Other use cases
- checksum checking
- Bitboards in chess engines
- Gray code
- FFT (radix-2 Cooley–Tukey)


## Extra Goodies

- Clears the lowest set bit: `x &= (x - 1)`
- Isolates the lowest set bit: `x & -x`





