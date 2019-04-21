cmake_minimum_required(VERSION 2.8)
project(slime)

set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${PROJECT_SOURCE_DIR}/bin)
set(CMAKE_ARCHIVE_OUTPUT_DIRECTORY ${PROJECT_SOURCE_DIR}/lib)
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY ${PROJECT_SOURCE_DIR}/lib)

include_directories(.)

set(CMAKE_CXX_FLAGS "-std=c++98 -O3 -mtune=native -Wno-unused-value -D NDEBUG -D __STDC_LIMIT_MACROS -D __STDC_FORMAT_MACROS -D LOG") # -static

add_executable(slime_static
        Solver.cc
        Main.cc
        SimpSolver.cc
        Options.cc
        System.cc
        )

target_link_libraries(slime_static z)