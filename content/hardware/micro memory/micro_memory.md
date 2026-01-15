# Micro Memory

[dronebot workshop](https://www.youtube.com/watch?v=x5ew5GjKLlQ)

# Types of Memory

- Flash = non-volatile storage, big, slower, limited writes
- SRAM = fast working memory, small, volatile
- PSRAM (if present) = big working memory, volatile, slower, sometimes restricted
- ROM = factory code (bootloader + helpers)

Caches / MMU mapping = the “bridge” that makes external flash/PSRAM feel usable at runtime

---

## [FLASH](https://en.wikipedia.org/wiki/Flash_memory)
Non-volatile, static, usually larger than RAM. 
Stores your program (firmware), constant assets, and sometimes filesystems. 
Flash is erased in blocks/sectors, not byte-by-byte.
Erased flash bits are typically 1; programming flips selected bits to 0.
To change a 0 back to a 1, you must erase the whole sector.
Writes are relatively expensive and flash has limited write endurance. 


## RAM
volatile, dynamic (working) memory.
Typically stores:
- stack (function call frames / local vars)
- heap (malloc/new, dynamic buffers, and other runtime allocations)
- .data / .bss global and static variables. 


## ROM 
This is non-volatile factory code that is provided by the chip vendor and includes the bootloader and helper routines. 

## Extra memory flavors

Depending on the MCU family, you’ll see:
- TCM (tightly coupled memory): very fast deterministic access
- DMA-capable RAM: memory regions the DMA engine can read/write
- Cache SRAM: SRAM used for instruction/data caching
- Retention / RTC memory: small memory that can survive deep sleep


# Memory Pipeline
Lets say we have some c++ source code, we compile it to machine code resulting in object (.o) files. These files have different sections depending on the compiler but some common sections are:
- .text : machine code
- .rodata : read-only constants (strings, const tables)
- .data : initialized globals/statics (has a flash “load image”, and a RAM “run image”)
- .bss : zero-initialized globals/statics
- plus platform-specific sections (interrupt vectors, IRAM text, etc.)

Then the linker uses the linker script, which describes the memory layout of the microcontroller, ie where the different types of memory are and how big they are, to decide where every section lives at runtime. Then the linker takes the object file and produces the final executable and writes it to flash memory. On reset / boot the early boot (ROM + bootloader) runs, copies .data values from flash to RAM, zeros .bss, and caches / MMu mappings are configured. Finally, the program begins execution.  


# [Esp32 specific](https://docs.espressif.com/projects/esp-idf/en/v4.4.1/esp32s3/api-guides/memory-types.html) 

Most ESP32 modules use external SPI (or OPI) flash which store: bootloader + app partitions + OTA slots. 

The main idea behind the ESP32 memory is that it can execute code "from flash" through an instruction cache. 

## SRAM
Internal SRAM hold the main working memory which includes:
- stacks for tasks
- heap allocs
- small hot buffers (often DMA buffers)

### IRAM vs DRAM

IRAM and DRAM are specific allocations or uses of internal SRAM. 

IRAM stores code that must run fast / concurrently even when flash cache is unavailable. Example uses: ISRs, timing-critical routines, and tiny inner loops where cache misses hurt. 

DRAM is used for data such as globals, heap, stacks, and buffers.
