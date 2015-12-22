Created by Torsten Moeller (vis@cs.sfu.ca), April 6 2004
last modified by $Author: jpeltier $ $Date: 2007-04-03 16:51:34 -0700 (Tue, 03 Apr 2007) $

This distribution provides a document class for formatting papers
according to the specifications for submission to conferences sponsored
by the IEEE Visualization & Graphics Technical Committee (VGTC). This
includes:

Conferences that use the 'conf' document option:
- IEEE Virtual Reality
- IEEE Symposium on 3D User Interfaces
- Symposium on Haptic Interfaces for Virtual Environment and Teleoperator Systems
- IEEE Symposium on Asia Pacific Visualisation
- IEEE Symposium on Interactive Ray Tracing
- IEEE Symposium on Visual Analytics Science and Technology
- IEEE Symposium on Visual Analytics Science and Technology
- IEEE Visualization Conference (Posters Only)
- IEEE Information Visualization Conference (Posters Only)
- IEEE Symposium on Volume Graphics

It contains seven files:

README          - this file
vgtc.cls        - the VGTC class file, which should be placed,
                  somewhere in the TeX search path
template.tex    - an example paper
template.bib    - a small bibliography file used by the example
sample.eps      - an image used by the example paper
template-conf.pdf    - an example proper pdf output in default
                          conference mode
makefile     - makefile including bibtex compilation and proper PDF
generation

Prior to "building" a paper please be sure to run

  make clean

This will ensure that the paper is built cleanly each and every time. We
suggest to run this command before each new compilation.

To compile the example, run

  make

or manually, if the makefile does not work for you

  latex template
  bibtex template
  latex template
  latex template

If you run 'make' for the first time, a successful compilation will create
a file called 'template.pdf'. Please make sure, that its layout is
identical to the file 'template-conf.pdf' provided with this package.

The included makefile also allows you to run each step of the process
manually.  Below are a list of available options that may be passed to
make

 "make clean"
   removes all files that can be generated automatically.

 "make gs7"
   This will perform all functions to build a proper paper using Ghostscript 7.

 "make gs8"
   This will perform all functions to build a proper paper using Ghostscript 8.
 
 "make dvi"
   This will process the .tex file and produce a DVI output file.  This
   step may process the .tex file several times to process all references
   and citations.

 "make ps"
   This will process the .tex file and the DVI output and convert it to a
   PostScript file.

 "make pdf"
   This will process the .tex file, the DVI file and the PostScript file
   and produce the final PDF file.

If you have problems with the makefile please notify us with the output of
the errors produced when running make and we will work to figure out the
resolution.


To produce proper pdf output, please use:
  dvips -t letter -Pdownload35 -Ppdf -G0 template.dvi -o template.ps

The "-Ppdf" and "-G0" flags should be specified in that order; reversing
them does not work, and will result in unacceptable results.

The following information is an exerpt from the ACM SIGGRAPH Conference /
Symposium / Workshop Content Formatting Instructions which can be found
here.

 http://www.siggraph.org/publications/instructions/author-instructions.pdf

If you are using version 7.x of GhostScript, please use the following
method of invoking ps2pdf in order to embed all typefaces and ensure
that images are not downsampled or subsampled in the PDF creation process:

 ps2pdf -dCompatibilityLevel=1.3 -dMaxSubsetPct=100 \
        -dSubsetFonts=true -dEmbedAllFonts=true \
        -dAutoFilterColorImages=false -dAutoFilterGrayImages=false \
        -dColorImageFilter=/FlateEncode -dGrayImageFilter=/FlateEncode \
        -dMonoImageFilter=/FlateEncode template.ps template.pdf

If you are using version 8.x of GhostScript, please use this method in
place of the example above:

 ps2pdf -dPDFSETTINGS=/prepress -dCompatibilityLevel=1.3 \
        -dAutoFilterColorImages=false -dAutoFilterGrayImages=false \
        -dColorImageFilter=/FlateEncode -dGrayImageFilter=/FlateEncode \
        -dMonoImageFilter=/FlateEncode template.ps template.pdf

This has been incorporated into the makefile and should no longer be needed
unless you are building the file manually.
