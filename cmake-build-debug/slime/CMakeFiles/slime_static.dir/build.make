# CMAKE generated file: DO NOT EDIT!
# Generated by "Unix Makefiles" Generator, CMake Version 3.13

# Delete rule output on recipe failure.
.DELETE_ON_ERROR:


#=============================================================================
# Special targets provided by cmake.

# Disable implicit rules so canonical targets will work.
.SUFFIXES:


# Remove some rules from gmake that .SUFFIXES does not remove.
SUFFIXES =

.SUFFIXES: .hpux_make_needs_suffix_list


# Suppress display of executed commands.
$(VERBOSE).SILENT:


# A target that is always out of date.
cmake_force:

.PHONY : cmake_force

#=============================================================================
# Set environment variables for the build.

# The shell in which to execute make rules.
SHELL = /bin/sh

# The CMake executable.
CMAKE_COMMAND = "/Users/maxtuno/Library/Application Support/JetBrains/Toolbox/apps/CLion/ch-0/191.6183.77/CLion.app/Contents/bin/cmake/mac/bin/cmake"

# The command to remove a file.
RM = "/Users/maxtuno/Library/Application Support/JetBrains/Toolbox/apps/CLion/ch-0/191.6183.77/CLion.app/Contents/bin/cmake/mac/bin/cmake" -E remove -f

# Escaping for special characters.
EQUALS = =

# The top-level source directory on which CMake was run.
CMAKE_SOURCE_DIR = /Users/maxtuno/Desktop/Release/slime-sat-solver

# The top-level build directory on which CMake was run.
CMAKE_BINARY_DIR = /Users/maxtuno/Desktop/Release/slime-sat-solver/cmake-build-debug

# Include any dependencies generated for this target.
include slime/CMakeFiles/slime_static.dir/depend.make

# Include the progress variables for this target.
include slime/CMakeFiles/slime_static.dir/progress.make

# Include the compile flags for this target's objects.
include slime/CMakeFiles/slime_static.dir/flags.make

slime/CMakeFiles/slime_static.dir/Solver.cc.o: slime/CMakeFiles/slime_static.dir/flags.make
slime/CMakeFiles/slime_static.dir/Solver.cc.o: ../slime/Solver.cc
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green --progress-dir=/Users/maxtuno/Desktop/Release/slime-sat-solver/cmake-build-debug/CMakeFiles --progress-num=$(CMAKE_PROGRESS_1) "Building CXX object slime/CMakeFiles/slime_static.dir/Solver.cc.o"
	cd /Users/maxtuno/Desktop/Release/slime-sat-solver/cmake-build-debug/slime && /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/c++  $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -o CMakeFiles/slime_static.dir/Solver.cc.o -c /Users/maxtuno/Desktop/Release/slime-sat-solver/slime/Solver.cc

slime/CMakeFiles/slime_static.dir/Solver.cc.i: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green "Preprocessing CXX source to CMakeFiles/slime_static.dir/Solver.cc.i"
	cd /Users/maxtuno/Desktop/Release/slime-sat-solver/cmake-build-debug/slime && /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/c++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -E /Users/maxtuno/Desktop/Release/slime-sat-solver/slime/Solver.cc > CMakeFiles/slime_static.dir/Solver.cc.i

slime/CMakeFiles/slime_static.dir/Solver.cc.s: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green "Compiling CXX source to assembly CMakeFiles/slime_static.dir/Solver.cc.s"
	cd /Users/maxtuno/Desktop/Release/slime-sat-solver/cmake-build-debug/slime && /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/c++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -S /Users/maxtuno/Desktop/Release/slime-sat-solver/slime/Solver.cc -o CMakeFiles/slime_static.dir/Solver.cc.s

slime/CMakeFiles/slime_static.dir/Main.cc.o: slime/CMakeFiles/slime_static.dir/flags.make
slime/CMakeFiles/slime_static.dir/Main.cc.o: ../slime/Main.cc
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green --progress-dir=/Users/maxtuno/Desktop/Release/slime-sat-solver/cmake-build-debug/CMakeFiles --progress-num=$(CMAKE_PROGRESS_2) "Building CXX object slime/CMakeFiles/slime_static.dir/Main.cc.o"
	cd /Users/maxtuno/Desktop/Release/slime-sat-solver/cmake-build-debug/slime && /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/c++  $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -o CMakeFiles/slime_static.dir/Main.cc.o -c /Users/maxtuno/Desktop/Release/slime-sat-solver/slime/Main.cc

slime/CMakeFiles/slime_static.dir/Main.cc.i: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green "Preprocessing CXX source to CMakeFiles/slime_static.dir/Main.cc.i"
	cd /Users/maxtuno/Desktop/Release/slime-sat-solver/cmake-build-debug/slime && /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/c++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -E /Users/maxtuno/Desktop/Release/slime-sat-solver/slime/Main.cc > CMakeFiles/slime_static.dir/Main.cc.i

slime/CMakeFiles/slime_static.dir/Main.cc.s: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green "Compiling CXX source to assembly CMakeFiles/slime_static.dir/Main.cc.s"
	cd /Users/maxtuno/Desktop/Release/slime-sat-solver/cmake-build-debug/slime && /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/c++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -S /Users/maxtuno/Desktop/Release/slime-sat-solver/slime/Main.cc -o CMakeFiles/slime_static.dir/Main.cc.s

slime/CMakeFiles/slime_static.dir/SimpSolver.cc.o: slime/CMakeFiles/slime_static.dir/flags.make
slime/CMakeFiles/slime_static.dir/SimpSolver.cc.o: ../slime/SimpSolver.cc
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green --progress-dir=/Users/maxtuno/Desktop/Release/slime-sat-solver/cmake-build-debug/CMakeFiles --progress-num=$(CMAKE_PROGRESS_3) "Building CXX object slime/CMakeFiles/slime_static.dir/SimpSolver.cc.o"
	cd /Users/maxtuno/Desktop/Release/slime-sat-solver/cmake-build-debug/slime && /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/c++  $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -o CMakeFiles/slime_static.dir/SimpSolver.cc.o -c /Users/maxtuno/Desktop/Release/slime-sat-solver/slime/SimpSolver.cc

slime/CMakeFiles/slime_static.dir/SimpSolver.cc.i: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green "Preprocessing CXX source to CMakeFiles/slime_static.dir/SimpSolver.cc.i"
	cd /Users/maxtuno/Desktop/Release/slime-sat-solver/cmake-build-debug/slime && /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/c++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -E /Users/maxtuno/Desktop/Release/slime-sat-solver/slime/SimpSolver.cc > CMakeFiles/slime_static.dir/SimpSolver.cc.i

slime/CMakeFiles/slime_static.dir/SimpSolver.cc.s: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green "Compiling CXX source to assembly CMakeFiles/slime_static.dir/SimpSolver.cc.s"
	cd /Users/maxtuno/Desktop/Release/slime-sat-solver/cmake-build-debug/slime && /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/c++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -S /Users/maxtuno/Desktop/Release/slime-sat-solver/slime/SimpSolver.cc -o CMakeFiles/slime_static.dir/SimpSolver.cc.s

slime/CMakeFiles/slime_static.dir/Options.cc.o: slime/CMakeFiles/slime_static.dir/flags.make
slime/CMakeFiles/slime_static.dir/Options.cc.o: ../slime/Options.cc
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green --progress-dir=/Users/maxtuno/Desktop/Release/slime-sat-solver/cmake-build-debug/CMakeFiles --progress-num=$(CMAKE_PROGRESS_4) "Building CXX object slime/CMakeFiles/slime_static.dir/Options.cc.o"
	cd /Users/maxtuno/Desktop/Release/slime-sat-solver/cmake-build-debug/slime && /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/c++  $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -o CMakeFiles/slime_static.dir/Options.cc.o -c /Users/maxtuno/Desktop/Release/slime-sat-solver/slime/Options.cc

slime/CMakeFiles/slime_static.dir/Options.cc.i: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green "Preprocessing CXX source to CMakeFiles/slime_static.dir/Options.cc.i"
	cd /Users/maxtuno/Desktop/Release/slime-sat-solver/cmake-build-debug/slime && /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/c++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -E /Users/maxtuno/Desktop/Release/slime-sat-solver/slime/Options.cc > CMakeFiles/slime_static.dir/Options.cc.i

slime/CMakeFiles/slime_static.dir/Options.cc.s: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green "Compiling CXX source to assembly CMakeFiles/slime_static.dir/Options.cc.s"
	cd /Users/maxtuno/Desktop/Release/slime-sat-solver/cmake-build-debug/slime && /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/c++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -S /Users/maxtuno/Desktop/Release/slime-sat-solver/slime/Options.cc -o CMakeFiles/slime_static.dir/Options.cc.s

slime/CMakeFiles/slime_static.dir/System.cc.o: slime/CMakeFiles/slime_static.dir/flags.make
slime/CMakeFiles/slime_static.dir/System.cc.o: ../slime/System.cc
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green --progress-dir=/Users/maxtuno/Desktop/Release/slime-sat-solver/cmake-build-debug/CMakeFiles --progress-num=$(CMAKE_PROGRESS_5) "Building CXX object slime/CMakeFiles/slime_static.dir/System.cc.o"
	cd /Users/maxtuno/Desktop/Release/slime-sat-solver/cmake-build-debug/slime && /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/c++  $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -o CMakeFiles/slime_static.dir/System.cc.o -c /Users/maxtuno/Desktop/Release/slime-sat-solver/slime/System.cc

slime/CMakeFiles/slime_static.dir/System.cc.i: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green "Preprocessing CXX source to CMakeFiles/slime_static.dir/System.cc.i"
	cd /Users/maxtuno/Desktop/Release/slime-sat-solver/cmake-build-debug/slime && /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/c++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -E /Users/maxtuno/Desktop/Release/slime-sat-solver/slime/System.cc > CMakeFiles/slime_static.dir/System.cc.i

slime/CMakeFiles/slime_static.dir/System.cc.s: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green "Compiling CXX source to assembly CMakeFiles/slime_static.dir/System.cc.s"
	cd /Users/maxtuno/Desktop/Release/slime-sat-solver/cmake-build-debug/slime && /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/c++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -S /Users/maxtuno/Desktop/Release/slime-sat-solver/slime/System.cc -o CMakeFiles/slime_static.dir/System.cc.s

# Object files for target slime_static
slime_static_OBJECTS = \
"CMakeFiles/slime_static.dir/Solver.cc.o" \
"CMakeFiles/slime_static.dir/Main.cc.o" \
"CMakeFiles/slime_static.dir/SimpSolver.cc.o" \
"CMakeFiles/slime_static.dir/Options.cc.o" \
"CMakeFiles/slime_static.dir/System.cc.o"

# External object files for target slime_static
slime_static_EXTERNAL_OBJECTS =

../slime/bin/slime_static: slime/CMakeFiles/slime_static.dir/Solver.cc.o
../slime/bin/slime_static: slime/CMakeFiles/slime_static.dir/Main.cc.o
../slime/bin/slime_static: slime/CMakeFiles/slime_static.dir/SimpSolver.cc.o
../slime/bin/slime_static: slime/CMakeFiles/slime_static.dir/Options.cc.o
../slime/bin/slime_static: slime/CMakeFiles/slime_static.dir/System.cc.o
../slime/bin/slime_static: slime/CMakeFiles/slime_static.dir/build.make
../slime/bin/slime_static: slime/CMakeFiles/slime_static.dir/link.txt
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green --bold --progress-dir=/Users/maxtuno/Desktop/Release/slime-sat-solver/cmake-build-debug/CMakeFiles --progress-num=$(CMAKE_PROGRESS_6) "Linking CXX executable ../../slime/bin/slime_static"
	cd /Users/maxtuno/Desktop/Release/slime-sat-solver/cmake-build-debug/slime && $(CMAKE_COMMAND) -E cmake_link_script CMakeFiles/slime_static.dir/link.txt --verbose=$(VERBOSE)

# Rule to build all files generated by this target.
slime/CMakeFiles/slime_static.dir/build: ../slime/bin/slime_static

.PHONY : slime/CMakeFiles/slime_static.dir/build

slime/CMakeFiles/slime_static.dir/clean:
	cd /Users/maxtuno/Desktop/Release/slime-sat-solver/cmake-build-debug/slime && $(CMAKE_COMMAND) -P CMakeFiles/slime_static.dir/cmake_clean.cmake
.PHONY : slime/CMakeFiles/slime_static.dir/clean

slime/CMakeFiles/slime_static.dir/depend:
	cd /Users/maxtuno/Desktop/Release/slime-sat-solver/cmake-build-debug && $(CMAKE_COMMAND) -E cmake_depends "Unix Makefiles" /Users/maxtuno/Desktop/Release/slime-sat-solver /Users/maxtuno/Desktop/Release/slime-sat-solver/slime /Users/maxtuno/Desktop/Release/slime-sat-solver/cmake-build-debug /Users/maxtuno/Desktop/Release/slime-sat-solver/cmake-build-debug/slime /Users/maxtuno/Desktop/Release/slime-sat-solver/cmake-build-debug/slime/CMakeFiles/slime_static.dir/DependInfo.cmake --color=$(COLOR)
.PHONY : slime/CMakeFiles/slime_static.dir/depend

