PHONY: github

github:
	npm run build
	rm -rf docs
	cp -r public docs
	git add -A
	git commit -m "update github pages"
	git push