### To "build" the project so it can be pasted to Khan Academy:

First, open `index.html` and find the list of script elements:
```html
<script src="src/import-test.js"></script>
<script src="src/main.js"></script>
```

For each script, create a script element in `ka-build.html`, and copy-paste the contents of that source file into it.
```html
<!-- src/import-test.js -->
<script type>
    // paste "src/import-test.js" here
</script>
<!-- src/main.js -->
<script type>
    // paste "src/main.js" here
</script>
```
If an element already exists for a file, overwrite whatever was in there before the build.

Note: Make sure each script element has `type` at the beginning of it - this is required to make ES6 work on Khan Academy.