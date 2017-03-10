PYGMENTIZE=pygmentize -f html

all: append-child-sample.html

%.html : %.js
	$(PYGMENTIZE) -o $@ $<
