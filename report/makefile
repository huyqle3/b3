# $Id: makefile 11 2007-04-03 22:25:53Z jpeltier $
# This file seems to originate from something called 'the ultimate
# latex makefile' that different authors worked on. Find original
# versions at:
# http://tadek.pietraszek.org/blog/2006/03/24/the-ultimate-latex-makefile/
# (c) by Tadeusz Pietraszek
# http://www.acoustics.hut.fi/u/mairas/UltimateLatexMakefile/ 
# (c) by Matti Airas
#
# Call 'make dvi' for minimal compilation, to check for proper latex
# syntax. This can be much faster than a full PDF generation when big
# figures are involved.
#
#----------------------------------------------------------------------------
#adjust the following for your purpose

#set the a .dvi name that corresponds to your main .tex file
DVIFILES = template.dvi
MAINTEXFILE = $(DVIFILES:.dvi=.tex)
SUBTEXFILES = 
BIBFILES = template.bib

#switch = to # when using ps2pdf in win32 (mingw/msys), i.e. uncomment 2nd line
#E=\=
E=\#

#adjust paper size: letter/a4
PAPERSIZE=letter
PDFLATEXPAPERSIZE="-sPAPERSIZE$E$(PAPERSIZE)"
DVIPSPAPERSIZE=-t $(PAPERSIZE)
#uncomment the following two lines when using option tvcgpapersize
#DVIPSPAPERSIZE=-T 7.875in,10.75in
#PDFLATEXPAPERSIZE=

#----------------------------------------------------------------------------
LATEX = latex
BIBTEX = bibtex
L2H = latex2html
PDFLATEX = ps2pdf
DVIPS = dvips 

RERUN = "(There were undefined references|Rerun to get (cross-references|the bars) right)"
RERUNBIB = "No file.*\.bbl|Citation.*undefined" 

PSFILES  = $(DVIFILES:.dvi=.ps) 

PDFFILES7 = $(DVIFILES:.dvi=.pdf7) 
PDFFILES8 = $(DVIFILES:.dvi=.pdf8) 

COPY = if test -r $*.toc; then cp $*.toc $*.toc.bak; fi 
#RM = /usr/bin/rm -f 
RM = rm -f 

all:	msg gs8

msg:
	@echo "  You must define gs7 for GhostScript 7 or gs8 for GhostScript 8"
	@echo "  If you are not sure which to run please type gs -v to get your version"
	@echo "  i.e. make gs7"

gs7:        clean dvi ps pdf7

gs8:        clean dvi ps pdf8

dvi:           $(DVIFILES)

ps:           $(PSFILES)

pdf7:           $(PDFFILES7)

pdf8:           $(PDFFILES8)

$(MAINTEXFILE) : $(SUBTEXFILES) $(BIBFILES)

%.dvi:			%.tex
				$(COPY);$(LATEX) $<
				egrep -c $(RERUNBIB) $*.log && ($(BIBTEX) $*;$(COPY);$(LATEX) $<) ; true
				egrep $(RERUN) $*.log && ($(COPY);$(LATEX) $<) ; true
				egrep $(RERUN) $*.log && ($(COPY);$(LATEX) $<) ; true
				if cmp -s $*.toc $*.toc.bak; then . ;else $(LATEX) $< ; fi
				$(RM) $*.toc.bak
# Display relevant warnings
				egrep -i "(Reference|Citation).*undefined" $*.log ; true

%.ps:			%.dvi
#				dvips -T 7.875in,10.75in -Ppdf -G0 $< -o $@  #use tvcgpapersize
#				dvips -Ppdf -G0 $< -o $@
				dvips $(DVIPSPAPERSIZE) -Pdownload35 -Ppdf -G0 $< -o $@
#				dvips $< -o $@

%.pdf7:			%.ps
	$(PDFLATEX) \
	$(PDFLATEXPAPERSIZE) \
	"-dMaxSubsetPct$E100" \
	"-dCompatibilityLevel$E1.3" \
	"-dSubsetFonts$Etrue" \
	"-dEmbedAllFonts$Etrue" \
	"-dAutoFilterColorImages$Efalse" \
	"-dAutoFilterGrayImages$Efalse" \
	"-dColorImageFilter$E/FlateEncode" \
	"-dGrayImageFilter$E/FlateEncode" \
	"-dMonoImageFilter$E/FlateEncode" \
	$< template.pdf

#				$(PDFLATEX) $<

%.pdf8:                 %.ps
	$(PDFLATEX) \
	$(PDFLATEXPAPERSIZE) \
	"-dPDFSETTINGS=/prepress" \
	"-dCompatibilityLevel=1.3" \
	"-dAutoFilterColorImages=false" \
	"-dAutoFilterGrayImages=false" \
	"-dColorImageFilter=/FlateEncode" \
	"-dGrayImageFilter=/FlateEncode" \
	"-dMonoImageFilter=/FlateEncode" \
	"-dDownsampleGrayImages=false" \
	"-dDownsampleColorImages=false" \
	$< template.pdf
#                               $(PDFLATEX) $<

# cleans anything that can be re-generated automatically, plus emacs backups
clean: 
				rm -f *.aux *.log *.bbl *.blg *.brf *.cb *.ind *.idx *.ilg	\
				*.inx *.toc *.out $(DVIFILES) $(PSFILES) template.pdf *~

.PHONY : all pdf ps dvi clean $(MAINTEXFILE)
