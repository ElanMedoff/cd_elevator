echo 'running tester.sh ...'

current_pwd=$(pwd)

if ! deno task args "$@"; then 
  echo 'error running `deno task args`, exiting early'
  return
fi

if ! deno task init_kv; then
  echo 'error running `deno task init_kv`, exiting early'
  return
fi


if ! deno task init_stack --pwd="$current_pwd"; then
  echo 'error running `deno task init_stack`, exiting early'
  return
fi

if cd "$2"; then 
  deno task push_stack --pwd="$current_pwd" "$2"
fi

deno task cleanup
echo 'after running'
