# Intro

- We can create a project using `cargo new`.
- We can build a project using `cargo build`.
- We can build and run a project in one step using `cargo run`.
- We can build a project without producing a binary to check for errors using `cargo check`.  

Instead of saving the result of the build in the same directory as our code, Cargo stores it in the target/debug directory.

- Use `cargo build --release` to compile with optimizations

## Scalar Types

### Integers

| Type | Bits | Min Value | Max Value |
|:-----:|:----:|:----------:|:----------:|
| i8   | 8    | -128 | 127 |
| u8   | 8    | 0 | 255 |
| i16  | 16   | -32,768 | 32,767 |
| u16  | 16   | 0 | 65,535 |
| i32  | 32   | -2,147,483,648 | 2,147,483,647 |
| u32  | 32   | 0 | 4,294,967,295 |
| i64  | 64   | -9,223,372,036,854,775,808 | 9,223,372,036,854,775,807 |
| u64  | 64   | 0 | 18,446,744,073,709,551,615 |
| i128 | 128  | -170,141,183,460,469,231,731,687,303,715,884,105,728 | 170,141,183,460,469,231,731,687,303,715,884,105,727 |
| u128 | 128  | 0 | 340,282,366,920,938,463,463,374,607,431,768,211,455 |
| isize | arch | −(2^(N−1)) | 2^(N−1) − 1 |
| usize | arch | 0 | 2^N − 1 |


### Floating-point:
`f32` and `f64`, default is f64

### Bool
`true` or `false`, self explanatory

### Character 
`char`, 4 bytes, specified with single quotation marks, as oppsoed to string literals, which use double quotation marks. 


## Compound Types

### Tuple
`tup`: Fixed length but can store multiple scalar types. Specified by a comma separated list. 
Can be destructured / unpacked with 
`let tup = (500, 6.4, 1); let (x, y, z) = tup;`

## Statements vs expressions


`fn main() {
    let x = (let y = 6);
}`
The let y = 6 statement does not return a value, so there isn’t anything for x to bind to. This is different from what happens in other languages, such as C and Ruby, where the assignment returns the value of the assignment. In those languages, you can write x = y = 6 and have both x and y have the value 6; that is not the case in Rust.

dont put a semicolon after return call. 

# Ownership

- Each value in Rust has an owner
- there can only be one owner at a time
- when the owner goes out of scope, the value will be dropped.

Note: string literals are strings that are defined at compile time. I.e. their values can be hard coded into the program binary.

For compound types such as Strings binding one variable to another not only shallow copies the pointer, size, and capacity information associated with a String but also sets the initial variable to invalid since it no longer has ownership of the underlying heap string data. 

ex
```rs
let s1 = String::from("hello");
let s2 = s1;
println!("{s1}, world!");
```
This will cause an error because Rust prevents you from using the invalidated reference.

If we do want to deeply copy the heap data of the String, not just the stack data, we can use a common method called `clone`.

ex.
```rs
let s1 = String::from("hello");
let s2 = s1.clone();
println!("s1 = {s1}, s2 = {s2}");
```

The ownership of a variable follows the same pattern every time: Assigning a value to another variable moves it. When a variable that includes data on the heap goes out of scope, the value will be cleaned up by `drop` unless ownership of the data has been moved to another variable.

## References and borrowing

The action of creating a reference borrowing. As in real life, if a person owns something, you can borrow it from them. When you’re done, you have to give it back. You don’t own it. But since we don't own it we also cant change it, thus references are also immutable (not modifiable) by default.  

If we want references to be mutable we have to specify it just as with variables:

```rs
fn main() {
    let mut s = String::from("hello");
    change(&mut s);
}

fn change(some_string: &mut String) {
    some_string.push_str(", world");
}
```
Mutable references have one big restriction: If you have a mutable reference to a value, you can have no other references to that value. 

We also cannot have a mutable reference while we have an immutable one to the same value.

To recap:

- At any given time, you can have either one mutable reference or any number of immutable references.

- References must always be valid.


## Slice type


A **slice** is a **non-owning, borrowed view** into a contiguous sequence of elements (such as an array, vector, or string). It allows access to part or all of a collection **without copying or allocating memory**.

### Key Points
- Slices do **not own** data
- They **borrow** from an existing collection
- Length is known at **runtime**
- Memory is **contiguous**
- Can be immutable or mutable:
  - `&[T]` — immutable slice
  - `&mut [T]` — mutable slice
  - `&str` — string slice

### Example
```rust
let v = vec![1, 2, 3, 4];
let s = &v[1..3]; // borrows [2, 3]
```

A slice is represented as a pointer + length, making slicing O(1) with no data copying.

# Structs

